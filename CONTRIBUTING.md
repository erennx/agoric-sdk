# Contributing to the Agoric SDK

Thanks for getting involved!

## Platforms, Dev Tools and Testing

We support MacOS, Linux, and Windows Subsystem for Linux (WSL).

For many of the packages here, JavaScript development tools suffice:

 - [node](https://nodejs.org/) 14.15.0 or higher
 - [yarn](https://classic.yarnpkg.com/en/docs/install) (`npm install -g yarn`)

But to ensure contributions are compatible with all packages, you will
also need:

 - [Golang](https://golang.org/doc/install) (version 1.17 or higher)
 - a C compiler and make
   - On linux, `apt install build-essentials` or the like
   - On MacOS, `xcode-select --install` or similar
   - On WSL, use `nmake` instead of `make`

To check that everything is working before you start, or
to thoroughly check a contribution, run:

```
yarn # short for: yarn install
yarn build
yarn test
yarn lint
```

A standard Visual Studio Code configuration can be initialized or updated by
running [`scripts/configure-vscode.sh`](scripts/configure-vscode.sh).

See also notes on [Coding
style](https://github.com/Agoric/agoric-sdk/wiki/Coding-Style),
including [unit
testing](https://github.com/Agoric/agoric-sdk/wiki/agoric-sdk-unit-testing)
etc.

## Landing pull requests

The agreement so far is for every change to have a [conventional commit
message][CC] and for every commit following the leftmost parent from
main/master to pass tests in CI.

```
* Must pass
* Must pass
* Merge commit must pass
|\
| * Fixed the broken code
| * Adopted some broken code from somewhere
|/
* Must pass
* Must pass
```

We also have agreement, once code review has begun, that we should as often as
practical append commits with follow-up changes so subsequent reviews can be
incremental, but that these follow-up commits should not survive to land on
main/master.
This does not preclude rebases, which are necessary to confirm that the PR
continues to pass tests as the main/master branch moves under it.

We favor "Squash and merge" (which requires the PR title to be a conventional
commit) since it requires the least careful attention, especially when there
are appended follow-up changes, but it's not the only tool in the toolbox.

For example, we preserved the narrative of the `xsnap` introduction as a
sequence of commits (1. Moddable contributions, 2. our C changes, 3. our JS
wrapper) with a merge commit for the PR ("Create a merge commit"). Step 1
wasn't buildable and step 2 had no tests, but the merge commit passes CI and
all the others non-working commits are not reachable by a left-hand-rule
traversal of the parents, so `git bisect` will still work if we need it.

We've also squashed follow-up commits manually (through an interactive rebase)
after a PR had been approved and tests were passing, then landed the stack with
"Rebase and merge" or "Create merge commit".

[CC]: https://www.conventionalcommits.org/en/v1.0.0/
