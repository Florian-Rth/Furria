using Furria.Tests.Analyzers;
using Xunit;

namespace Furria.Tests.Analyzers.Tests;

public sealed class LoggingAnalyzerTests
{
    private const string SerilogStub = """
        namespace Serilog
        {
            public static class Log
            {
                public static void Information(string messageTemplate) { }
            }
        }
        """;

    private const string LoggerStub = """
        namespace Microsoft.Extensions.Logging
        {
            public interface ILogger { }
            public static class LoggerExtensions
            {
                public static void LogInformation(
                    this ILogger logger, string message, params object[] args) { }
            }
        }
        """;

    [Fact]
    public async Task Should_FlagTheStaticSerilogLog_When_InProductionCode()
    {
        const string source =
            SerilogStub
            + """
                namespace N { class C { void M() => Serilog.Log.Information("Started"); } }
                """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoStaticSerilogLogAnalyzer(),
            "MET008",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_NotFlagTheStaticSerilogLog_When_InTestProject()
    {
        const string source =
            SerilogStub
            + """
                namespace N { class C { void M() => Serilog.Log.Information("Started"); } }
                """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoStaticSerilogLogAnalyzer(),
            "MET008",
            source,
            isTestProject: true
        );

        Assert.Empty(diagnostics);
    }

    [Theory]
    [InlineData("System.Console.WriteLine(\"x\")")]
    [InlineData("System.Console.Write(\"x\")")]
    [InlineData("System.Console.Error.WriteLine(\"x\")")]
    [InlineData("System.Console.Out.WriteLine(\"x\")")]
    public async Task Should_FlagConsoleOutput_When_InProductionCode(string statement)
    {
        var source = $$"""
            namespace N { class C { void M() { {{statement}}; } } }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoConsoleOutputAnalyzer(),
            "MET009",
            source
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_NotFlagConsoleOutput_When_InTestProject()
    {
        const string source = """
            namespace N { class C { void M() => System.Console.WriteLine("x"); } }
            """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new NoConsoleOutputAnalyzer(),
            "MET009",
            source,
            isTestProject: true
        );

        Assert.Empty(diagnostics);
    }

    [Theory]
    [InlineData("Login failed for {Email}: {LoginFailureReason}")]
    [InlineData("HTTP {RequestMethod} responded in {Elapsed:0} ms")]
    [InlineData("Handled {@Command} for {$Kind}")]
    [InlineData("Refresh token replay for family {TokenFamilyId}")]
    [InlineData("Escaped {{braces}} are text")]
    public async Task Should_AcceptTheTemplate_When_EveryPlaceholderIsPascalCaseAndPersonFree(
        string template
    )
    {
        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new LogTemplatePlaceholderAnalyzer(),
            "MET010",
            LoggedWith(template)
        );

        Assert.Empty(diagnostics);
    }

    [Theory]
    [InlineData("Seeded {accountId}")]
    [InlineData("Seeded {0}")]
    [InlineData("Seeded {account_id}")]
    public async Task Should_FlagThePlaceholder_When_ItIsNotPascalCase(string template)
    {
        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new LogTemplatePlaceholderAnalyzer(),
            "MET010",
            LoggedWith(template)
        );

        Assert.Single(diagnostics);
    }

    [Theory]
    [InlineData("Created {FirstName}")]
    [InlineData("Created {LastName}")]
    [InlineData("Called {PhoneNumber}")]
    [InlineData("Moved to {Street}")]
    [InlineData("Born {BirthDate}")]
    [InlineData("Posted {AnnouncementBody}")]
    [InlineData("Tried {Password}")]
    [InlineData("Issued {RefreshToken}")]
    [InlineData("Stored {PasswordHash}")]
    public async Task Should_FlagThePlaceholder_When_ItNamesPersonalData(string template)
    {
        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new LogTemplatePlaceholderAnalyzer(),
            "MET010",
            LoggedWith(template)
        );

        Assert.Single(diagnostics);
    }

    [Fact]
    public async Task Should_FlagTheSerilogPlaceholder_When_ItIsNotPascalCase()
    {
        const string source =
            SerilogStub
            + """
                namespace N { class C { void M() => Serilog.Log.Information("Seeded {accountId}"); } }
                """;

        var diagnostics = await AnalyzerHarness.RunForRuleAsync(
            new LogTemplatePlaceholderAnalyzer(),
            "MET010",
            source
        );

        Assert.Single(diagnostics);
    }

    private static string LoggedWith(string template) =>
        LoggerStub
        + $$"""
            namespace N
            {
                using Microsoft.Extensions.Logging;
                class C
                {
                    void M(ILogger logger) => logger.LogInformation({{Quoted(template)}}, 1, 2);
                }
            }
            """;

    private static string Quoted(string template) => "\"" + template + "\"";
}
