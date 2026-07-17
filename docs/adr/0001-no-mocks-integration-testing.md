# No-mocks integration testing, enforced by owned Roslyn analyzers

Backend tests run against real infrastructure only: real Postgres in a Testcontainer, the real
HTTP pipeline, real auth — mocking frameworks (Moq, NSubstitute) and EF InMemory are banned, as
compile errors via the owned MET001–MET006 analyzers (see `docs/server/TESTING.md`). We chose
this over conventional unit tests with mocks because AI-driven development needs self-validation
that proves observable behaviour, not interactions — a suite that passes must mean the system
works. The trade-off (slower suite startup, Docker required everywhere incl. CI) is accepted;
the setup is distilled from a previous project where it proved itself.

## Consequences

- Every test-running environment needs Docker.
- Test doubles exist only for owned seams (e.g. a future `FakeMessageBus` for an owned
  message-bus interface), reviewed case by case.
- Reversing this after hundreds of tests exist is prohibitively expensive — deliberate lock-in.
