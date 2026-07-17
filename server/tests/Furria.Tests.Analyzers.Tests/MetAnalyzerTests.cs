using Furria.Tests.Analyzers;
using Xunit;

namespace Furria.Tests.Analyzers.Tests;

public sealed class MetAnalyzerTests
{
    [Fact]
    public async Task Should_FlagNSubstituteUsing_When_MockingFrameworkImported()
    {
        const string source = "using NSubstitute; namespace N { class C { } }";

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoMockingFrameworkAnalyzer(),
            "MET001",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_NotFlag_When_NoMockingFrameworkImported()
    {
        const string source = "using System; namespace N { class C { } }";

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoMockingFrameworkAnalyzer(),
            "MET001",
            source
        );

        Assert.Empty(diagnostics);
    }

    [Fact]
    public async Task Should_FlagUseInMemoryDatabase_When_CalledInCode()
    {
        const string source = """
            namespace N
            {
                class C
                {
                    void M(object builder)
                    {
                        ((dynamic)builder).UseInMemoryDatabase("test");
                    }
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoInMemoryDatabaseAnalyzer(),
            "MET002",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_FlagInMemoryNamespace_When_Imported()
    {
        const string source =
            "using Microsoft.EntityFrameworkCore.InMemory; namespace N { class C { } }";

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoInMemoryDatabaseAnalyzer(),
            "MET002",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_FlagBadName_When_TestMethodViolatesConvention()
    {
        const string source = """
            namespace N
            {
                class FactAttribute : System.Attribute { }
                class C
                {
                    [Fact]
                    public void TestSomething() { }
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new TestMethodNamingAnalyzer(),
            "MET003",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_NotFlag_When_TestMethodFollowsConvention()
    {
        const string source = """
            namespace N
            {
                class FactAttribute : System.Attribute { }
                class C
                {
                    [Fact]
                    public void Should_Work_When_Invoked() { }
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new TestMethodNamingAnalyzer(),
            "MET003",
            source
        );

        Assert.Empty(diagnostics);
    }

    [Fact]
    public async Task Should_FlagBadName_When_ScenarioSegmentIsLowercase()
    {
        const string source = """
            namespace N
            {
                class FactAttribute : System.Attribute { }
                class C
                {
                    [Fact]
                    public void Should_Work_When_invoked() { }
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new TestMethodNamingAnalyzer(),
            "MET003",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_FlagDbContextLocal_When_DeclaredWithExplicitType()
    {
        const string source = """
            namespace N
            {
                class FactAttribute : System.Attribute { }
                class AppDbContext : Microsoft.EntityFrameworkCore.DbContext { }
                class C
                {
                    static T Resolve<T>() => default!;

                    [Fact]
                    public void Should_Touch_When_Run()
                    {
                        AppDbContext db = Resolve<AppDbContext>();
                    }
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoDbContextInTestBodyAnalyzer(),
            "MET005",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_FlagMissingCollection_When_ClassInjectsApiFixture()
    {
        const string source = """
            namespace N
            {
                class ApiTestFixture { }
                class CloseTicketTests
                {
                    public CloseTicketTests(ApiTestFixture fixture) { }
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new IntegrationCollectionMarkerAnalyzer(),
            "MET004",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_NotFlag_When_ClassHasApiCollectionMarker()
    {
        const string source = """
            namespace N
            {
                class ApiTestFixture { }
                class CollectionAttribute : System.Attribute
                {
                    public CollectionAttribute(string name) { }
                }
                [Collection("Api")]
                class CloseTicketTests
                {
                    public CloseTicketTests(ApiTestFixture fixture) { }
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new IntegrationCollectionMarkerAnalyzer(),
            "MET004",
            source
        );

        Assert.Empty(diagnostics);
    }

    [Fact]
    public async Task Should_FlagDbContextResolution_When_UsedInTestBody()
    {
        const string source = """
            namespace N
            {
                class FactAttribute : System.Attribute { }
                class AppDbContext : Microsoft.EntityFrameworkCore.DbContext { }
                class C
                {
                    static T GetRequiredService<T>() => default!;

                    [Fact]
                    public void Should_Touch_When_Run()
                    {
                        var db = GetRequiredService<AppDbContext>();
                    }
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoDbContextInTestBodyAnalyzer(),
            "MET005",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_NotFlag_When_TestBodyAvoidsDbContext()
    {
        const string source = """
            namespace N
            {
                class FactAttribute : System.Attribute { }
                class C
                {
                    [Fact]
                    public void Should_DoNothing_When_Run()
                    {
                        var x = 1;
                    }
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoDbContextInTestBodyAnalyzer(),
            "MET005",
            source
        );

        Assert.Empty(diagnostics);
    }

    [Fact]
    public async Task Should_FlagUtcNow_When_UsedInProductionCode()
    {
        const string source = """
            namespace N
            {
                class C
                {
                    System.DateTimeOffset M() => System.DateTimeOffset.UtcNow;
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoAmbientClockAnalyzer(),
            "MET006",
            source,
            isTestProject: false
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_NotFlagUtcNow_When_InTestProject()
    {
        const string source = """
            namespace N
            {
                class C
                {
                    System.DateTimeOffset M() => System.DateTimeOffset.UtcNow;
                }
            }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoAmbientClockAnalyzer(),
            "MET006",
            source,
            isTestProject: true
        );

        Assert.Empty(diagnostics);
    }
}
