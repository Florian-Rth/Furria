using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace MyProduct.Tests.Analyzers;

// MET002 — bans the EF Core InMemory provider. `UseInMemoryDatabase(...)` calls and
// `using Microsoft.EntityFrameworkCore.InMemory;` directives are both flagged; every test
// runs against real Postgres.
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class NoInMemoryDatabaseAnalyzer : DiagnosticAnalyzer
{
    private const string InMemoryNamespace = "Microsoft.EntityFrameworkCore.InMemory";
    private const string InMemoryMethod = "UseInMemoryDatabase";

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.NoInMemoryDatabase);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(AnalyzeUsing, SyntaxKind.UsingDirective);
        context.RegisterSyntaxNodeAction(AnalyzeInvocation, SyntaxKind.InvocationExpression);
    }

    private static void AnalyzeUsing(SyntaxNodeAnalysisContext context)
    {
        var directive = (UsingDirectiveSyntax)context.Node;
        if (directive.Name?.ToString() != InMemoryNamespace)
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(
                MetDiagnostics.NoInMemoryDatabase,
                directive.GetLocation(),
                InMemoryNamespace
            )
        );
    }

    private static void AnalyzeInvocation(SyntaxNodeAnalysisContext context)
    {
        var invocation = (InvocationExpressionSyntax)context.Node;
        if (
            invocation.Expression is not MemberAccessExpressionSyntax member
            || member.Name.Identifier.ValueText != InMemoryMethod
        )
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(
                MetDiagnostics.NoInMemoryDatabase,
                member.Name.GetLocation(),
                InMemoryMethod
            )
        );
    }
}
