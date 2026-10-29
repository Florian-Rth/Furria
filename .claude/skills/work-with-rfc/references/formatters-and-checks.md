# Formatters and checks

After a phase, run the **matching formatter** then the project's checks, and only commit once the
system is in an intact state. Detect the toolchain from files in the repo rather than guessing.

## Detection heuristics

Look for project manifests / config and prefer the project's own scripts when they exist:

| Signal | Ecosystem | Format | Checks (build / lint / test) |
| --- | --- | --- | --- |
| `package.json` | Node/TS | `prettier` / `biome` (or `npm run format`) | `npm run build`, `npm run lint`, `npm test` (or the scripts defined) |
| `pyproject.toml` / `setup.cfg` | Python | `ruff format` / `black` | `ruff check`, `mypy`, `pytest` |
| `Cargo.toml` | Rust | `cargo fmt` | `cargo build`, `cargo clippy`, `cargo test` |
| `go.mod` | Go | `gofmt`/`goimports` | `go build ./...`, `go vet ./...`, `go test ./...` |
| `pom.xml` / `build.gradle` | Java/Kotlin | `spotless`/`ktlint` | `mvn verify` / `gradle build` |
| `*.csproj`/`*.sln` | .NET | `dotnet format` | `dotnet build`, `dotnet test` |
| `Makefile` / `Justfile` | any | `make fmt` / `just fmt` if present | `make check` / `make test` targets |

Always prefer an explicit project target (`make check`, `npm run ci`, a `pre-commit` config,
`lefthook`/`husky` hooks, or a `CONTRIBUTING.md` that names commands) over generic defaults — it
encodes what the maintainers actually expect.

## Order

1. Format (so the diff is clean before checks/commit).
2. Build / compile.
3. Lint / type-check.
4. Tests.

## Handling failures

- Small, localized fixes → just fix them.
- Larger or design-affecting failures → escalate per the skill's review step (ask the user; consider
  `/grill-with-docs`, else `/grilling`, else `/grill-me`; for re-architecture, propose a new RFC).
- Never commit a phase while the build or tests are red — that breaks the intact-state invariant.
