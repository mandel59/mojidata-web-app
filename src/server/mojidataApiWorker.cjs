const fs = require("node:fs")
const path = require("node:path")
const { createRequire } = require("node:module")
const { parentPort } = require("node:worker_threads")

if (!parentPort) {
  throw new Error("This module must be run as a worker thread")
}

const nodeRequire = createRequire(__filename)

function joinModulePath(...parts) {
  return parts.join("/")
}

const {
  expandOverlaid,
  nodeLength,
  tokenizeIDS,
} = nodeRequire("@mandel59/idsdb-utils")

function resolvePnpVirtualPath(filePath) {
  if (!path.isAbsolute(filePath)) return filePath
  try {
    const pnp = nodeRequire("pnpapi")
    return (pnp.resolveVirtual && pnp.resolveVirtual(filePath)) || filePath
  } catch {
    return filePath
  }
}

let sqlJsPromise
async function getSqlJsNode() {
  sqlJsPromise ||= (() => {
    const wasmPath = resolvePnpVirtualPath(
      nodeRequire.resolve(joinModulePath("sql.js", "dist", "sql-wasm.wasm")),
    )
    const initSqlJs = nodeRequire("sql.js")
    return initSqlJs({
      locateFile: () => wasmPath,
    })
  })()
  return sqlJsPromise
}

async function openDatabaseFromFile(filePath) {
  const SQL = await getSqlJsNode()
  const realPath = resolvePnpVirtualPath(filePath)
  const bytes = fs.readFileSync(realPath)
  return new SQL.Database(new Uint8Array(bytes))
}

function regexpAllJson(input, pattern) {
  const string = String(input ?? "")
  const re = new RegExp(String(pattern), "gu")
  const out = []
  let match
  while ((match = re.exec(string))) {
    out.push({
      substr: match[0],
      groups: match.groups ?? match.slice(1),
    })
  }
  return JSON.stringify(out)
}

async function initMojidataDb(db) {
  db.create_function("regexp_all", regexpAllJson)
  db.create_function("parse_int", (s, base) => {
    const i = parseInt(s, base)
    if (!Number.isSafeInteger(i)) {
      return null
    }
    return i
  })
  db.create_function("regexp", (pattern, s) => {
    return new RegExp(pattern, "u").test(s) ? 1 : 0
  })
}

function createMojidataDbProvider(openDatabase) {
  let dbPromise
  return function getMojidataDb() {
    dbPromise ||= openDatabase().then(async (db) => {
      await initMojidataDb(db)
      return db
    })
    return dbPromise
  }
}

function createCachedPromise(factory) {
  let promise
  return () => {
    promise ||= factory()
    return promise
  }
}

const queryExpressions = [
  ["char", `@ucs`],
  ["UCS", `printf('U+%04X', unicode(@ucs))`],
  [
    "aj1",
    `CASE WHEN (@ucs IN (SELECT UCS FROM aj1)) THEN json_object(
    'CID', (SELECT CID FROM aj1 WHERE UCS = @ucs ORDER BY vertical ASC, UniJIS2004 DESC, CID ASC LIMIT 1),
    'jp90', (SELECT CID FROM aj1_UniJIS_H WHERE UCS = @ucs),
    'jp90_V', (SELECT CID FROM aj1_UniJIS_V WHERE UCS = @ucs),
    'jp04', (SELECT CID FROM aj1_UniJIS2004_H WHERE UCS = @ucs),
    'jp04_V', (SELECT CID FROM aj1_UniJIS2004_V WHERE UCS = @ucs),
    'mac_jp90', (SELECT CID FROM aj1_UniJISX0213_H WHERE UCS = @ucs),
    'mac_jp90_V', (SELECT CID FROM aj1_UniJISX0213_V WHERE UCS = @ucs),
    'mac_jp04', (SELECT CID FROM aj1_UniJISX02132004_H WHERE UCS = @ucs),
    'mac_jp04_V', (SELECT CID FROM aj1_UniJISX02132004_V WHERE UCS = @ucs)
  ) END`,
  ],
  [
    "ids",
    `(SELECT json_group_array(json_object('IDS', ids.IDS, 'source', ids.source)) FROM ids WHERE ids.UCS = @ucs)`,
  ],
  [
    "ids_similar",
    `(SELECT json_group_array(json_object('UCS', ids.UCS, 'IDS', ids.IDS, 'source', ids.source)) FROM ids WHERE ids.IDS glob ('[〾↔↷]' || @ucs))`,
  ],
  [
    "ids_comment",
    `(SELECT json_group_array(ids_comment.comment) FROM ids_comment WHERE ids_comment.UCS = @ucs)`,
  ],
  [
    "ivs",
    `(SELECT json_group_array(json_object(
        'char', ivs.IVS,
        'IVS', printf('%04X_%04X', unicode(ivs.IVS), unicode(substr(ivs.IVS, 2))),
        'collection', ivs.collection,
        'code', ivs.code)) FROM ivs WHERE ivs.IVS glob (@ucs || '*'))`,
  ],
  [
    "ivs_duplicate",
    `(select json_group_array(json_array(
      printf('%04X_%04X', unicode(ivs1.IVS), unicode(substring(ivs1.IVS, 2, 1))),
      ivs1.IVS,
      printf('%04X_%04X', unicode(ivs2.IVS), unicode(substring(ivs2.IVS, 2, 1))),
      ivs2.IVS,
      collection,
      code))
    from ivs as ivs1
      join ivs as ivs2 using (collection, code)
    where (ivs1.IVS <> ivs2.IVS) and (ivs1.IVS glob (@ucs || '*')))`,
  ],
  [
    "svs_cjkci",
    `(
        SELECT json_group_array(json_object(
            'SVS_char', SVS,
            'SVS', printf('%04X_%04X', unicode(SVS), unicode(substr(SVS, 2))),
            'CJKCI_char', CJKCI,
            'CJKCI', printf('U+%04X', unicode(CJKCI))))
        FROM svs_cjkci
        WHERE (SVS glob @ucs || '*') OR (CJKCI glob @ucs || '*'))`,
  ],
  [
    "unihan",
    `(SELECT json_group_object(property, value) FROM unihan WHERE unihan.UCS = @ucs)`,
  ],
  [
    "unihan_rs",
    `(SELECT json_object(
      'kRSAdobe_Japan1_6', (
        SELECT json_group_array(json_array(
          cast(json_extract(r.value, '$.groups.r') as integer),
          cast(json_extract(r.value, '$.groups.s') as integer),
          部首漢字,
          cast(json_extract(r.value, '$.groups.rs') as integer),
          printf('CID+%d', cast(json_extract(r.value, '$.groups.cid') as integer)))
          ORDER BY
            cast(json_extract(r.value, '$.groups.cid') as integer),
            cast(json_extract(r.value, '$.groups.r') as integer),
            cast(json_extract(r.value, '$.groups.rs') as integer))
        FROM unihan_kRSAdobe_Japan1_6 AS u
        JOIN json_each(regexp_all(u.value, '(?:^| )[CV]\\+(?<cid>[0-9]{1,5})\\+(?<r>[1-9][0-9]{0,2})\\.(?<rs>[1-9][0-9]?)\\.(?<s>[0-9]{1,2})')) AS r
        JOIN radicals ON radicals.部首 = json_extract(r.value, '$.groups.r')
        WHERE UCS = @ucs),
      'kRSUnicode', (
        SELECT json_group_array(json_array(
          cast(json_extract(r.value, '$.groups.r') as integer),
          cast(json_extract(r.value, '$.groups.s') as integer),
          radical_CJKUI,
          json_extract(r.value, '$.groups.r')))
        FROM unihan_kRSUnicode AS u
        JOIN json_each(regexp_all(u.value, '(?:^| )(?<r>[1-9][0-9]{0,2}''{0,2})\\.(?<s>-?[0-9]{1,2})')) AS r
        JOIN radicals ON radicals.radical = json_extract(r.value, '$.groups.r')
        WHERE UCS = @ucs)
    ))`,
  ],
  [
    "unihan_fts",
    `(SELECT json_group_array(json_array(printf('U+%04X', unicode(UCS)), UCS, property, value)) FROM
      (SELECT * FROM unihan
        WHERE unicode(@ucs) > 0xFF AND (
          unihan.value glob printf('*%s*', @ucs)
          OR (unihan.value glob printf('*U+%04X*', unicode(@ucs))
            AND NOT unihan.value glob printf('*U+%04X[0-9A-F]*', unicode(@ucs))))
          AND unihan.property NOT IN ('kJapanese', 'kSMSZD2003Readings', 'kFanqie')
        ORDER BY UCS
        LIMIT 100))`,
  ],
  [
    "unihan_variant",
    `(SELECT json_group_array(CASE WHEN additional_data IS NOT NULL THEN json_array(property, printf('U+%04X', unicode(value)), value, additional_data) ELSE json_array(property, printf('U+%04X', unicode(value)), value) END) FROM unihan_variant WHERE unihan_variant.UCS = @ucs)`,
  ],
  [
    "unihan_variant_inverse",
    `(SELECT json_group_array(CASE WHEN additional_data IS NOT NULL THEN json_array(property, printf('U+%04X', unicode(UCS)), UCS, additional_data) ELSE json_array(property, printf('U+%04X', unicode(UCS)), UCS) END) FROM unihan_variant WHERE unihan_variant.value = @ucs)`,
  ],
  [
    "joyo",
    `(SELECT json_group_array(json_object('音訓', 音訓, '例', json(例), '備考', 備考)) FROM joyo WHERE joyo.漢字 = @ucs)`,
  ],
  [
    "joyo_kangxi",
    `(SELECT json_group_array(康熙字典体) FROM joyo_kangxi WHERE joyo_kangxi.漢字 = @ucs)`,
  ],
  [
    "joyo_kangxi_inverse",
    `(SELECT json_group_array(漢字) FROM joyo_kangxi WHERE joyo_kangxi.康熙字典体 = @ucs)`,
  ],
  [
    "doon",
    `(SELECT json_group_array(json_object('書きかえる漢語', 書きかえる漢語, '書きかえた漢語', 書きかえた漢語, '採用した文書', 採用した文書)) FROM doon WHERE 書きかえる漢字\t= @ucs OR 書きかえた漢字 = @ucs)`,
  ],
  [
    "nyukan",
    `(
        SELECT json_group_array(json_object(
            '正字の種類', 正字の種類,
            '簡体字等の文字コード等', 簡体字等の文字コード等,
            '簡体字等のUCS', 簡体字等のUCS,
            '正字の文字コード等', 正字の文字コード等,
            '正字のUCS', 正字のUCS,
            '順位', 順位))
        FROM nyukan
        WHERE 簡体字等のUCS = @ucs OR 正字のUCS = @ucs
    )`,
  ],
  [
    "tghb",
    `(
        SELECT json_group_array(json_object(
            '序号', tghb.序号,
            '规范字', tghb.规范字,
            '级', tghb.级,
            '笔画', tghb.笔画,
            '註解', tghb.註解,
            '异体字', (SELECT json_group_array(json_object(
                '繁体字', v.繁体字,
                '异体字', v.异体字,
                '註解', v.註解
            )) FROM tghb_variants AS v WHERE v.规范字 = tghb.规范字)
        ))
        FROM tghb
        WHERE @ucs = tghb.规范字 OR @ucs IN (SELECT v.异体字 FROM tghb_variants AS v WHERE v.规范字 = tghb.规范字)
    )`,
  ],
  [
    "mji",
    `(
        SELECT json_group_array(json_object(
            '文字', coalesce(実装したSVS, 実装したUCS, 実装したMoji_JohoコレクションIVS),
            'MJ文字図形名', MJ文字図形名,
            '対応するUCS', CASE WHEN 対応するUCS IS NOT NULL THEN printf('U+%04X', unicode(対応するUCS)) END,
            '実装したUCS', CASE WHEN 実装したUCS IS NOT NULL THEN printf('U+%04X', unicode(実装したUCS)) END,
            '実装したMoji_JohoコレクションIVS', CASE WHEN 実装したMoji_JohoコレクションIVS IS NOT NULL THEN printf('%04X_%04X', unicode(実装したMoji_JohoコレクションIVS), unicode(substr(実装したMoji_JohoコレクションIVS, 2))) END,
            '実装したSVS', CASE WHEN 実装したSVS IS NOT NULL THEN printf('%04X_%04X', unicode(実装したSVS), unicode(substr(実装したSVS, 2))) END,
            '戸籍統一文字番号', 戸籍統一文字番号,
            '住基ネット統一文字コード', 住基ネット統一文字コード,
            '入管正字コード', 入管正字コード,
            '入管外字コード', 入管外字コード,
            '漢字施策', 漢字施策,
            '対応する互換漢字', CASE WHEN 対応する互換漢字 IS NOT NULL THEN printf('U+%04X', unicode(対応する互換漢字)) END,
            'X0213', X0213,
            'X0213_包摂連番', X0213_包摂連番,
            'X0213_包摂区分', X0213_包摂区分,
            'X0212', X0212,
            'MJ文字図形バージョン', MJ文字図形バージョン,
            '登記統一文字番号', 登記統一文字番号,
            '部首・内画数', (SELECT json_group_array(json_array(
              部首,
              内画数,
              部首漢字
            )) FROM mji_rsindex JOIN radicals USING (部首) WHERE mji_rsindex.MJ文字図形名 = mji.MJ文字図形名),
            '総画数', 総画数,
            '読み', (SELECT json_group_array(読み) FROM mji_reading WHERE mji_reading.MJ文字図形名 = mji.MJ文字図形名),
            '大漢和', 大漢和,
            '日本語漢字辞典', 日本語漢字辞典,
            '新大字典', 新大字典,
            '大字源', 大字源,
            '大漢語林', 大漢語林,
            '更新履歴', (SELECT json_group_array(更新履歴) FROM mji_changelog WHERE mji_changelog.MJ文字図形名 = mji.MJ文字図形名),
            '備考', 備考,
            'mjsm', (
                SELECT json_group_array(json_array(
                    mjsm.表,
                    printf('U+%04X', unicode(mjsm.縮退UCS)),
                    mjsm.縮退UCS))
                FROM mjsm
                WHERE mji.MJ文字図形名 = mjsm.MJ文字図形名
                ORDER BY mjsm.表, mjsm.順位, mjsm.ホップ数
            )))
        FROM mji
        WHERE mji.対応するUCS = @ucs OR mji.実装したUCS = @ucs)`,
  ],
  [
    "mjsm_inverse",
    `(
        SELECT json_group_array(json_object(
            '表', mjsm.表,
            '文字', coalesce(実装したSVS, 実装したUCS, 実装したMoji_JohoコレクションIVS),
            'MJ文字図形名', mji.MJ文字図形名,
            '対応するUCS', CASE WHEN 対応するUCS IS NOT NULL THEN printf('U+%04X', unicode(対応するUCS)) END,
            '実装したUCS', CASE WHEN 実装したUCS IS NOT NULL THEN printf('U+%04X', unicode(実装したUCS)) END,
            '実装したMoji_JohoコレクションIVS', CASE WHEN 実装したMoji_JohoコレクションIVS IS NOT NULL THEN printf('%04X_%04X', unicode(実装したMoji_JohoコレクションIVS), unicode(substr(実装したMoji_JohoコレクションIVS, 2))) END,
            '実装したSVS', CASE WHEN 実装したSVS IS NOT NULL THEN printf('%04X_%04X', unicode(実装したSVS), unicode(substr(実装したSVS, 2))) END))
        FROM mji join mjsm on mji.MJ文字図形名 = mjsm.MJ文字図形名
        WHERE mjsm.縮退UCS = @ucs)`,
  ],
  [
    "mjih",
    `(SELECT json_group_array(json_object(
      'MJ文字図形名', MJ文字図形名,
      '文字', 文字,
      'CharacterName', CharacterName,
      'UCS符号位置', UCS符号位置,
      '字母', 字母,
      '字母のUCS符号位置', 字母のUCS符号位置,
      '音価', (SELECT json_group_array(音価) FROM mjih_phonetic AS p WHERE p.MJ文字図形名 = mjih.MJ文字図形名),
      '戸籍統一文字番号', 戸籍統一文字番号,
      '学術用変体仮名番号', 学術用変体仮名番号,
      '国語研URL', 国語研URL,
      '備考', 備考
    ))
    FROM mjih WHERE @ucs = mjih.文字 OR @ucs = mjih.字母 OR @ucs IN (SELECT 音価 FROM mjih_phonetic AS p WHERE p.MJ文字図形名 = mjih.MJ文字図形名))`,
  ],
  [
    "kdpv",
    `(
        SELECT json_group_object(rel, json(cs)) FROM (
            SELECT rel, json_group_array(c) AS cs FROM (
                SELECT DISTINCT rel, object AS c FROM kdpv WHERE subject glob @ucs || '*'
                UNION
                SELECT DISTINCT ifnull(rev, '~' || kdpv.rel) AS rel, subject AS c FROM kdpv LEFT JOIN kdpv_rels ON kdpv_rels.rel = kdpv.rel WHERE object glob @ucs || '*'
            )
            GROUP BY rel
        )
    )`,
  ],
]

const mojidataFieldNames = new Set(queryExpressions.map(([key]) => key))

function buildMojidataSelectQuery(selection) {
  const selected = new Set(selection)
  const a = []
  const selectAll = selected.size === 0
  for (const [name, e] of queryExpressions) {
    if (selectAll || selected.has(name)) {
      a.push(`'${name}', ${e}`)
    }
  }
  return `SELECT json_object(${a.join(",")}) AS vs`
}

const libsearchQueries = {
  UCS: `WITH x(x) AS (VALUES (parse_int(?, 16))) SELECT DISTINCT char(x) AS r FROM x WHERE char(x) regexp '^[\\p{L}\\p{N}\\p{S}]$'`,
  "mji.読み": `
    SELECT DISTINCT mji.対応するUCS AS r
    FROM mji
      JOIN mji_reading USING (MJ文字図形名)
    WHERE mji.対応するUCS IS NOT NULL
      AND mji_reading.読み = ?`,
  "mji.読み.prefix": `
    SELECT DISTINCT mji.対応するUCS AS r
    FROM mji
      JOIN mji_reading USING (MJ文字図形名)
    WHERE mji.対応するUCS IS NOT NULL
      AND mji_reading.読み glob (replace(?, '*', '') || '*')`,
  "mji.総画数": `
    SELECT DISTINCT mji.対応するUCS AS r
    FROM mji
    WHERE mji.対応するUCS IS NOT NULL
      AND mji.総画数 = cast(? as integer)`,
  "mji.総画数.lt": `
    SELECT DISTINCT mji.対応するUCS AS r
    FROM mji
    WHERE mji.対応するUCS IS NOT NULL
      AND mji.総画数 < cast(? as integer)`,
  "mji.総画数.le": `
    SELECT DISTINCT mji.対応するUCS AS r
    FROM mji
    WHERE mji.対応するUCS IS NOT NULL
      AND mji.総画数 <= cast(? as integer)`,
  "mji.総画数.gt": `
    SELECT DISTINCT mji.対応するUCS AS r
    FROM mji
    WHERE mji.対応するUCS IS NOT NULL
      AND mji.総画数 > cast(? as integer)`,
  "mji.総画数.ge": `
    SELECT DISTINCT mji.対応するUCS AS r
    FROM mji
    WHERE mji.対応するUCS IS NOT NULL
      AND mji.総画数 >= cast(? as integer)`,
  "mji.MJ文字図形名": `
    SELECT DISTINCT mji.対応するUCS AS r
    FROM mji
    WHERE mji.対応するUCS IS NOT NULL
      AND mji.MJ文字図形名 = ?`,
  "unihan.kTotalStrokes": `
    SELECT DISTINCT UCS AS r
    FROM unihan_kTotalStrokes
    WHERE cast(value as integer) = cast(? as integer)`,
  "unihan.kTotalStrokes.lt": `
    SELECT DISTINCT UCS AS r
    FROM unihan_kTotalStrokes
    WHERE cast(value as integer) < cast(? as integer)`,
  "unihan.kTotalStrokes.le": `
    SELECT DISTINCT UCS AS r
    FROM unihan_kTotalStrokes
    WHERE cast(value as integer) <= cast(? as integer)`,
  "unihan.kTotalStrokes.gt": `
    SELECT DISTINCT UCS AS r
    FROM unihan_kTotalStrokes
    WHERE cast(value as integer) > cast(? as integer)`,
  "unihan.kTotalStrokes.ge": `
    SELECT DISTINCT UCS AS r
    FROM unihan_kTotalStrokes
    WHERE cast(value as integer) >= cast(? as integer)`,
}

const libsearchQueries2 = {
  totalStrokes: `SELECT * FROM (${libsearchQueries["unihan.kTotalStrokes"].trim()} UNION ${libsearchQueries["mji.総画数"].trim()})`,
  "totalStrokes.lt": `SELECT * FROM (${libsearchQueries["unihan.kTotalStrokes.lt"].trim()} UNION ${libsearchQueries["mji.総画数.lt"].trim()})`,
  "totalStrokes.le": `SELECT * FROM (${libsearchQueries["unihan.kTotalStrokes.le"].trim()} UNION ${libsearchQueries["mji.総画数.le"].trim()})`,
  "totalStrokes.gt": `SELECT * FROM (${libsearchQueries["unihan.kTotalStrokes.gt"].trim()} UNION ${libsearchQueries["mji.総画数.gt"].trim()})`,
  "totalStrokes.ge": `SELECT * FROM (${libsearchQueries["unihan.kTotalStrokes.ge"].trim()} UNION ${libsearchQueries["mji.総画数.ge"].trim()})`,
}

function getQueryAndArgs(p, q) {
  const query = libsearchQueries[p]
  if (query) {
    return [query.trim(), [q]]
  }
  const query2 = libsearchQueries2[p]
  if (query2) {
    return [query2.trim(), [q, q]]
  }
  throw new Error(`Unknown query key: ${p}`)
}

async function pluckAll(getDb, query, args) {
  const db = await getDb()
  const stmt = db.prepare(query)
  stmt.bind(args)
  const out = []
  while (stmt.step()) {
    const row = stmt.getAsObject()
    if (typeof row.r === "string") out.push(row.r)
  }
  stmt.free()
  return out
}

function createLibSearch(getDb) {
  return {
    filterChars: async (chars, ps, qs) => {
      const queryAndArgs = ps.map((p, i) => getQueryAndArgs(p, qs[i]))
      const query = `WITH c(char) AS (select value from json_each(?))
        SELECT c.char AS r
        FROM c
        WHERE ${queryAndArgs
          .map(([query]) => `c.char IN (${query})`)
          .join(" AND ")}`
      const args = [].concat(...queryAndArgs.map(([_query, args]) => args))
      return await pluckAll(getDb, query, [JSON.stringify(chars), ...args])
    },
    search: async (ps, qs) => {
      const queryAndArgs = ps.map((p, i) => getQueryAndArgs(p, qs[i]))
      const query = queryAndArgs.map(([query]) => query).join("\nINTERSECT\n")
      const args = [].concat(...queryAndArgs.map(([_query, args]) => args))
      return await pluckAll(getDb, query, args)
    },
  }
}

const idsfindQueryContext = `
with tokens as (
    select
        idslist.key as key0,
        ts0.key as key1,
        ts.key as key,
        ts.value as token
    from json_each($idslist) as idslist
    join json_each(idslist.value) as ts0
    join json_each(ts0.value) as ts
),
decomposed as (
    select
        tokens.key0,
        tokens.key1,
        tokens.key,
        ifnull(idsfind.IDS_tokens, tokens.token) as tokens
    from tokens left join idsfind on idsfind.UCS = tokens.token
),
combinations as (
    select
        decomposed.key0,
        decomposed.key1,
        tokens,
        0 as level
    from decomposed where decomposed.key = 0
    union all
    select
        decomposed.key0,
        decomposed.key1,
        combinations.tokens || ' ' || decomposed.tokens,
        decomposed.key
    from combinations join decomposed
    where
        decomposed.key0 = combinations.key0
        and
        decomposed.key1 = combinations.key1
        and
        decomposed.key = combinations.level + 1
),
patterns as (
    select
        combinations.key0,
        combinations.key1,
        group_concat('("' || replace(replace(replace(replace(tokens, ' ？ ', '" AND "'), '？ ', ''), '" AND "？', ''), ' ？', '') || '")', ' OR ') as pattern
    from combinations
    where level = (
        select max(decomposed.key)
        from decomposed
        where decomposed.key0 = combinations.key0
          and decomposed.key1 = combinations.key1
    )
    group by key0, key1
),
token_pattern as (
    select group_concat('(' || pattern || ')', ' AND ') as pattern
    from (
        select key0, group_concat('(' || pattern || ')', ' OR ') as pattern
        from patterns
        group by key0
    )
),
results as (
    select char AS UCS
    from idsfind_fts
    join token_pattern
    join idsfind_ref using (docid)
    where IDS_tokens match pattern
)
`

const idsfindQuery = `${idsfindQueryContext}\nselect UCS from results`

function tokenizeIdsList(idslist) {
  const idslistTokenized = idslist.map(tokenizeIDS).map(expandOverlaid)
  const idslistWithoutVC = idslistTokenized.map((x) =>
    x.map((y) => y.map((z) => (/^[a-zａ-ｚ]$/.test(z) ? "？" : z))),
  )
  return {
    forQuery: idslistWithoutVC,
    forAudit: idslistTokenized,
  }
}

function idsmatch(tokens, pattern, getIDSTokens) {
  const matchFrom = (i) => {
    const vars = new Map()
    let k = i
    loop: for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] === "§") {
        if (k === 0 || k === tokens.length) {
          continue loop
        }
      } else if (pattern[j] === "？") {
        k += nodeLength(tokens, k)
        continue loop
      } else if (/^[a-zａ-ｚ]$/.test(pattern[j])) {
        const varname = pattern[j]
        const l = nodeLength(tokens, k)
        const slice = vars.get(varname)
        if (slice) {
          if (!slice.every((t, offset) => t === tokens[k + offset])) {
            return false
          }
        } else {
          vars.set(varname, tokens.slice(k, k + l))
        }
        k += l
        continue loop
      }
      const ts = getIDSTokens(pattern[j])
      if (ts.length === 0 && pattern[j] === tokens[k]) {
        k++
        continue loop
      }
      for (const t of ts) {
        const l = t.split(" ").length
        if (tokens.slice(k, k + l).join(" ") === t) {
          k += l
          continue loop
        }
      }
      return false
    }
    if (k > tokens.length) {
      return false
    }
    return true
  }
  let count = 0
  for (let i = 0; i < tokens.length; i++) {
    if (matchFrom(i)) {
      count++
    }
  }
  return count
}

function postaudit(result, idslist, getIDSTokensForUcs) {
  for (const IDS_tokens of getIDSTokensForUcs(result)) {
    const tokens = IDS_tokens.split(" ")
    if (
      idslist.every((patterns) => {
        return patterns.some(
          (pattern) =>
            idsmatch(tokens, pattern, getIDSTokensForUcs) >= pattern.multiplicity,
        )
      })
    ) {
      return true
    }
  }
  return false
}

function createIdsfind(getDb) {
  let statementsPromise
  async function getStatements() {
    statementsPromise ||= getDb().then((db) => {
      return {
        findStmt: db.prepare(idsfindQuery),
        getTokensStmt: db.prepare(`SELECT IDS_tokens FROM idsfind WHERE UCS = $ucs`),
      }
    })
    return statementsPromise
  }

  return async (idslist) => {
    const { findStmt, getTokensStmt } = await getStatements()
    const tokenized = tokenizeIdsList(idslist)

    const getIDSTokensForUcs = (ucs) => {
      const out = []
      getTokensStmt.bind({ $ucs: ucs })
      while (getTokensStmt.step()) {
        const row = getTokensStmt.getAsObject()
        if (typeof row.IDS_tokens === "string") out.push(row.IDS_tokens)
      }
      getTokensStmt.reset()
      return out
    }

    const out = []
    findStmt.bind({ $idslist: JSON.stringify(tokenized.forQuery) })
    while (findStmt.step()) {
      const row = findStmt.getAsObject()
      const ucs = row.UCS
      if (typeof ucs !== "string") continue
      if (postaudit(ucs, tokenized.forAudit, getIDSTokensForUcs)) {
        out.push(ucs)
      }
    }
    findStmt.reset()
    return out
  }
}

function createSqlJsApiDb({ getMojidataDb, getIdsfindDb }) {
  const { search, filterChars } = createLibSearch(getMojidataDb)
  const idsfind = createIdsfind(getIdsfindDb)

  const stmtCache = new Map()
  return {
    async getMojidataJson(char, select) {
      const db = await getMojidataDb()
      const selection = Array.isArray(select) ? select : []
      if (selection.some((s) => !mojidataFieldNames.has(s))) {
        throw new Error("invalid select")
      }
      const key = selection.length ? [...new Set(selection)].sort().join(",") : "*"
      let stmt = stmtCache.get(key)
      if (!stmt) {
        const query = buildMojidataSelectQuery(selection)
        stmt = db.prepare(query)
        stmtCache.set(key, stmt)
      }
      stmt.bind({ "@ucs": char })
      const ok = stmt.step()
      const row = ok ? stmt.getAsObject() : {}
      stmt.reset()
      return row.vs ?? null
    },
    idsfind,
    search,
    filterChars,
  }
}

function createNodeDb() {
  const mojidataDbPath = nodeRequire.resolve(
    joinModulePath("@mandel59/mojidata", "dist", "moji.db"),
  )
  const idsfindDbPath = nodeRequire.resolve(
    joinModulePath("@mandel59/idsdb", "idsfind.db"),
  )

  const getMojidataDb = createMojidataDbProvider(() =>
    openDatabaseFromFile(mojidataDbPath),
  )
  const getIdsfindDb = createCachedPromise(() => openDatabaseFromFile(idsfindDbPath))
  return createSqlJsApiDb({ getMojidataDb, getIdsfindDb })
}

const db = createNodeDb()

function serializeError(err) {
  if (!err || typeof err !== "object") {
    return { message: String(err) }
  }
  return {
    message: String(err.message || err),
    stack: typeof err.stack === "string" ? err.stack : undefined,
    name: typeof err.name === "string" ? err.name : undefined,
  }
}

parentPort.on("message", async (msg) => {
  const { id, method, args } = msg || {}
  try {
    if (typeof id !== "number") throw new Error("Invalid id")
    if (typeof method !== "string") throw new Error("Invalid method")
    if (!Array.isArray(args)) throw new Error("Invalid args")

    const fn = db[method]
    if (typeof fn !== "function") {
      throw new Error(`Unknown method: ${method}`)
    }
    const result = await fn.apply(db, args)
    parentPort.postMessage({ id, ok: true, result })
  } catch (err) {
    parentPort.postMessage({ id, ok: false, error: serializeError(err) })
  }
})
