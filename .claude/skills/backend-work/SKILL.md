---
name: backend-work
description: Mandatory rules for all C#/.NET backend work. Invoke before writing, planning or modifying any code in the server/ directory.
---

## Rules

### Code Quality
- Mark all classes `sealed` unless they serve as a base class
- Use records for immutable data types
- Cache immutable, deterministic property values as `static readonly` fields — never re-allocate them on every property access
- No primary constructors — use traditional constructor with `private readonly` fields
- No XML doc comments — write self-documenting code with speaking names
- Never write code comments — express every "what" and "why" through naming and extraction; the only allowed comment-syntax lines are functional directives (pragmas, suppressions)
- Zero compiler warnings — `TreatWarningsAsErrors` is enabled
- Nullable reference types are enabled — respect nullability in all code

### Class Member Ordering
- Order: const fields → static readonly → static → instance fields → properties → constructors → methods
- Within each group, order by access: private → protected → internal → public

### Methods
- Keep methods short — extract smaller methods aggressively
- Extract pure methods and mark them `[Pure]` where possible
- Use concise, speaking names that make the intent obvious
- Arguments must comply with the Law of Demeter

### Error Handling
- Use `Result<T>` for expected failures, not exceptions
- Use typed factory methods: `NotFound()`, `Conflict()`, `Validation()`
- Never use bare `Failure()`

### Mapping
- Manual mapping everywhere — AutoMapper is banned
- Map at each boundary: Request → Command/Query, Entity → Details/Summary, Details/Summary → Response

### Testing
- Implement every backend behavior change with the tdd skill — one failing test first, then the minimal implementation (red-green-refactor); pure refactors stay under existing green tests
- Use xUnit v3 `Assert.*` only — FluentAssertions is banned
- Test naming: `Should_Expected_When_Scenario`
- One test file per endpoint, file name mirrors endpoint name
- Never use Task.Delay to wait for async operations in tests — poll for the expected condition with a timeout instead
- Filter xUnit v3 tests with `dotnet test -- --filter-class <FullyQualifiedName>`; the VSTest `--filter`/`--treenode-filter` flags are silently ignored under Microsoft.Testing.Platform and run the whole suite
- When a test mutates host-singleton state that survives the per-test database reset (a monitor, cache, or background-service registry shared across the test collection), undo that mutation in a finally block so later suites in the collection are not contaminated

### Formatting
- CSharpier with 100 char width, LF line endings
- Run `dotnet csharpier format .` before committing

## Project Patterns

### Architecture
- Clean Architecture: Core → Application → Infrastructure ← Api/Worker/Collector
- Core has zero external dependencies
- Application references Core only
- Infrastructure references Core + Application
- Api/Worker/Collector reference Application + Infrastructure

### Type Layers
- Three distinct type layers that never leak across boundaries:
  - Endpoint layer: Request, Response (owned by Api/Worker/Collector)
  - Service layer: Command, Query, Details, Summary (owned by Application)
  - Persistence layer: EF Core entities (owned by Core, used only in Infrastructure)
- Services never share types with endpoint Requests/Responses
- EF Core entities never cross the service boundary

### Endpoints (FastEndpoints REPR)
- One file per endpoint containing: Endpoint + Request + Validator + Response
- Endpoints never share Requests or Responses between each other
- Endpoints never access DbContext directly — always go through a service
- Use `EndpointWithoutRequest` for no-request endpoints, not `EmptyRequest`
- Always pass cancellation explicitly: `await Send.OkAsync(response, cancellation: ct)` — FastEndpoints 8 deprecated the old `SendOkAsync(...)` extension family; use the `Send.*Async(...)` API
- Naming: `GetCameras`, `GetCameraById`, `PostCamera`, `PutCamera`, `DeleteCameraById`
- Action endpoints drop the HTTP prefix when unambiguous: `TestConnection`, `Login`
- Every endpoint with a request type must have a corresponding Validator class; endpoints with only route parameters still require a validator with at least a range check on the ID

### DTOs
- List items: `...SummaryDto` — Single entities: `...DetailsDto` — Request bodies: `...DataDto`
- All data-returning endpoints wrap results in `<Endpoint>Response`
- Delete endpoints return 204 with no response

### Services
- Services are sealed concrete classes named `<Entity>Service` (singular), injected directly — no interface until a genuine second implementation exists; never add one for mocking (ADR-0001 bans mocks)
- 0-2 args + CancellationToken: use primitives
- 3+ args: use Command or Query object
- Return types: `...Details` (single), `...Summary` (list item)
- Data input: `...Query` — Mutation input: `...Command`

### EF Core
- Navigation properties: nullable, not virtual
- Two DbContexts: AppDbContext (PostgreSQL), TimeSeriesDbContext (TimescaleDB)
- Every TimescaleDB hypertable needs its own retention policy — retention (add_retention_policy/drop_chunks) is per-hypertable and never cascades from a parent table, so a new hypertable without an explicit policy grows unbounded

### Dependencies
- Central Package Management via `Directory.Packages.props`
- DI registration via `AddApplication()` and `AddInfrastructure(IConfiguration)`
