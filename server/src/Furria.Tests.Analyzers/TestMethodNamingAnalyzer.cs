using System.Collections.Immutable;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

// MET003 — `[Fact]`/`[Theory]` methods must read as Should_<Expected>_When_<Scenario>.
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class TestMethodNamingAnalyzer : DiagnosticAnalyzer
{
    private static readonly Regex NamingPattern = new(
        @"^Should_[A-Z]\w*_When_[A-Z]\w*$",
        RegexOptions.Compiled
    );

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.TestMethodNaming);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(Analyze, SyntaxKind.MethodDeclaration);
    }

    private static void Analyze(SyntaxNodeAnalysisContext context)
    {
        var method = (MethodDeclarationSyntax)context.Node;
        if (!TestAttributes.IsTestMethod(method))
            return;

        var name = method.Identifier.ValueText;
        if (NamingPattern.IsMatch(name))
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(
                MetDiagnostics.TestMethodNaming,
                method.Identifier.GetLocation(),
                name
            )
        );
    }
}
