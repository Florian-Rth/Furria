using Microsoft.CodeAnalysis;

namespace Furria.Tests.Analyzers;

// Diagnostic descriptors for the test-infrastructure rules (MET001-MET007). All ship as
// Warning; severity is raised to Error via .editorconfig / TreatWarningsAsErrors.
internal static class MetDiagnostics
{
    private const string Category = "TestInfrastructure";

    public static readonly DiagnosticDescriptor NoMockingFramework = Create(
        "MET001",
        "No mocking framework",
        "Mocking frameworks are banned ('{0}'); use an owned Fake*/Capturing* double from Tests.Common/Doubles instead"
    );

    public static readonly DiagnosticDescriptor NoInMemoryDatabase = Create(
        "MET002",
        "No EF Core InMemory provider",
        "EF Core InMemory is banned ('{0}'); tests must run against real Postgres via ApiTestFixture"
    );

    public static readonly DiagnosticDescriptor TestMethodNaming = Create(
        "MET003",
        "Test method naming",
        "Test method '{0}' must match the Should_X_When_Y naming convention"
    );

    public static readonly DiagnosticDescriptor IntegrationCollectionMarker = Create(
        "MET004",
        "Integration test collection marker",
        "Integration test class '{0}' injects ApiTestFixture but is missing the [Collection(\"Api\")] marker"
    );

    public static readonly DiagnosticDescriptor NoDbContextInTestBody = Create(
        "MET005",
        "No DbContext access in test body",
        "Test method '{0}' accesses a DbContext directly; seed via TestContextBuilder and assert via Expected instead"
    );

    public static readonly DiagnosticDescriptor NoAmbientClock = Create(
        "MET006",
        "No ambient clock in production code",
        "'{0}' is banned in production code; read the current time from an injected TimeProvider"
    );

    public static readonly DiagnosticDescriptor DanglingAlias = Create(
        "MET007",
        "Dangling builder alias",
        "Alias \"{0}\" is referenced via {1} but never declared by an Add* builder call in the test class"
    );

    private static DiagnosticDescriptor Create(string id, string title, string messageFormat) =>
        new(
            id,
            title,
            messageFormat,
            Category,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true
        );
}
