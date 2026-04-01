#!/bin/sh
set -eu

base_url="${1:-http://127.0.0.1:3000}"
output_dir='public/storybook-fixtures'

mkdir -p "$output_dir"

curl -fsS "$base_url/api/glyphwiki/svg/u6f22" \
  -o "$output_dir/glyphwiki-u6f22.svg"
curl -fsS "$base_url/api/ipamjm/svg/u3402" \
  -o "$output_dir/ipamjm-u3402.svg"
