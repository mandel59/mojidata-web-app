# Contributing to Mojidata Web App

Thank you for your interest in contributing. This document describes how
contributions are licensed and what we expect from a pull request.

## License of contributions

Mojidata Web App is available under the [MIT license](LICENSE.md). By
contributing, you agree that your contribution is provided under the same MIT
license (inbound = outbound). We do not require a CLA.

Bundled fonts, data and other third-party resources keep their own licenses;
see [LICENSE.md](LICENSE.md) and [download.txt](download.txt). If your change
adds or updates such a resource, state its source URL, version and license in
the pull request, and keep the notices as described in
[docs/font-update.md](docs/font-update.md) where it applies. Do not submit
material you do not have the right to submit under these terms.

## Developer Certificate of Origin (DCO)

Every commit must carry a `Signed-off-by:` trailer with your name and email
address. It certifies the [Developer Certificate of Origin 1.1](https://developercertificate.org/):

> By making a contribution to this project, I certify that:
>
> (a) The contribution was created in whole or in part by me and I have the
> right to submit it under the open source license indicated in the file; or
>
> (b) The contribution is based upon previous work that, to the best of my
> knowledge, is covered under an appropriate open source license and I have the
> right under that license to submit that work with modifications, whether
> created in whole or in part by me, under the same open source license (unless
> I am permitted to submit under a different license), as indicated in the file;
> or
>
> (c) The contribution was provided directly to me by some other person who
> certified (a), (b) or (c) and I have not modified it.
>
> (d) I understand and agree that this project and the contribution are public
> and that a record of the contribution (including all personal information I
> submit with it, including my sign-off) is maintained indefinitely and may be
> redistributed consistent with this project or the open source license(s)
> involved.

With Git, add the trailer with `git commit -s`. With Jujutsu, put the line in the
commit message yourself:

```text
Signed-off-by: Your Name <you@example.com>
```

If you forgot to sign off, amend the commit (`git commit --amend -s`, or edit the
description with `jj describe`) and push again.

## AI-assisted contributions

You may use AI tools, but you are responsible for the result: review it, make
sure you can certify the DCO for it, and do not paste code whose origin or
license you cannot verify.

## Before opening a pull request

- Keep the change focused and describe what it does and how you checked it.
- Run `npm run lint` and `npm run build`, and the relevant tests. For UI changes,
  see the Playwright commands in [AGENTS.md](AGENTS.md).
- Follow the [style guide](STYLE_GUIDE.md) and the notes in
  [ARCHITECTURE.md](ARCHITECTURE.md).
- For larger changes, open an issue first so we can agree on the approach.
