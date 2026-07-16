# Backend Test System — Bootstrap Kit

Minimal kit to bootstrap the test system in a new .NET backend. Global placeholder: **`MyProduct`**
— rename once. Verified standalone: the analyzer project builds and its 18 tests pass with no
outside references.

```
test-system/
├── README.md         # this file — how to install
├── TESTING.md        # the conventions: how tests look, the rules → drop into the new repo
├── analyzers/        # complete Roslyn analyzer project (MET001–MET007) — copy as-is
├── analyzer-tests/   # its test project — copy as-is
├── common/           # 4 generic drop-in files for your test-infra project
└── wiring/           # MSBuild + .editorconfig files that turn the rules on
```

## Install

1. **Copy the analyzers.** `analyzers/` → `src/MyProduct.Tests.Analyzers/`,
   `analyzer-tests/` → `tests/MyProduct.Tests.Analyzers.Tests/`. Rename the `MyProduct`
   namespace/project to your product. `dotnet test` must be green before anything else.
2. **Wire them up** (files in `wiring/`, comments inside say where each goes):
   - `root.Directory.Build.props` → repo root. Carries `TreatWarningsAsErrors` and
     `<CompilerVisibleProperty Include="IsTestProject" />` — the latter is load-bearing: without
     it MET006 fires inside test projects too.
   - `src.Directory.Build.targets` → `src/`, `tests.Directory.Build.targets` → `tests/` —
     reference the analyzer project into every production/test project.
   - `tests.editorconfig` → `tests/.editorconfig` — all rules fatal from day one.
3. **Drop `TESTING.md` into the repo** (e.g. `docs/TESTING.md`) and point your CLAUDE.md at it.
   It defines the test shape and the contracts of the pieces you'll build.
4. **Create `src/MyProduct.Tests.Common`** with the four files from `common/`:
   - `DatabaseResetService.cs` — owned DB reset (truncate + singleton snapshot), generic: pass it
     your DbContexts and the identity entity types to snapshot.
   - `AliasRegistry.cs` — alias→value resolution with helpful misses.
   - `Polling.cs` — the sanctioned alternative to `Task.Delay`.
   - `SeedsAliasesAttribute.cs` — MET007 opt-out marker.
5. **Build the rest as tests demand it**, following the contracts in `TESTING.md`, in this order —
   each step ends with a green suite:
   1. `ApiTestFixture` (Testcontainers Postgres + `WebApplicationFactory`) → one trivial
      endpoint test.
   2. `JwtMinter` + `AddUser`/`ClientFor` → one authorized endpoint test.
   3. `TestContextBuilder` + materializer with your first bounded-context sub-builder.
   4. `Expected` DSL root + first assertion fragment; `FakeMessageBus` if you have a bus seam.

## Packages

| Project | Packages (versions already pinned in the csprojs) |
|---------|---------------------------------------------------|
| Tests.Analyzers | `Microsoft.CodeAnalysis.CSharp` |
| Tests.Analyzers.Tests | `xunit.v3`, `Microsoft.NET.Test.Sdk`, `Microsoft.CodeAnalysis.CSharp`, `Microsoft.EntityFrameworkCore` |
| Tests.Common (you create) | `Microsoft.AspNetCore.Mvc.Testing`, `Testcontainers.PostgreSql`, `Npgsql`, `Microsoft.Extensions.Time.Testing`, `xunit.v3`, your auth package (e.g. `FastEndpoints.Security`) |

## Analyzer portability notes

- The seven rules have zero domain coupling; only `IntegrationCollectionMarkerAnalyzer` (MET004)
  hardcodes two strings — fixture type `ApiTestFixture`, collection name `"Api"`. Keep those
  names (recommended) or adjust the constants.
- MET007 is tied to the naming convention `Add*` declares / `IdOf`/`ClientFor`/`NameOf` resolve —
  keep the convention and it works verbatim.
- MET001 bans `NSubstitute`/`Moq`; extend the set in `NoMockingFrameworkAnalyzer` if needed.
