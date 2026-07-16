using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

// MET001 — bans `using NSubstitute;` / `using Moq;`. Owned hand-rolled doubles
// (Fake*/Capturing* in Tests.Common/Doubles) are the only sanctioned test doubles.
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class NoMockingFrameworkAnalyzer : DiagnosticAnalyzer
{
    private static readonly ImmutableHashSet<string> BannedNamespaces = ImmutableHashSet.Create(
        "NSubstitute",
        "Moq"
    );

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.NoMockingFramework);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(Analyze, SyntaxKind.UsingDirective);
    }

    private static void Analyze(SyntaxNodeAnalysisContext context)
    {
        var directive = (UsingDirectiveSyntax)context.Node;
        if (directive.Name is null)
            return;

        var name = directive.Name.ToString();
        var root = name.Split('.')[0];
        if (!BannedNamespaces.Contains(root))
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(MetDiagnostics.NoMockingFramework, directive.GetLocation(), name)
        );
    }
}
