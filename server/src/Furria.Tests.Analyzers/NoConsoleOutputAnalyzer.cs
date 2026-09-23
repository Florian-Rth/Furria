using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class NoConsoleOutputAnalyzer : DiagnosticAnalyzer
{
    private const string ConsoleType = "System.Console";

    private static readonly ImmutableHashSet<string> OutputMembers = ImmutableHashSet.Create(
        "Write",
        "WriteLine",
        "Out",
        "Error"
    );

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.NoConsoleOutput);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterCompilationStartAction(start =>
        {
            if (start.Options.IsProductionCode())
                start.RegisterSyntaxNodeAction(Analyze, SyntaxKind.SimpleMemberAccessExpression);
        });
    }

    private static void Analyze(SyntaxNodeAnalysisContext context)
    {
        var access = (MemberAccessExpressionSyntax)context.Node;
        if (!OutputMembers.Contains(access.Name.Identifier.ValueText))
            return;

        var member = context.SemanticModel.GetSymbolInfo(access).Symbol;
        if (member?.ContainingType?.ToDisplayString() != ConsoleType)
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(MetDiagnostics.NoConsoleOutput, access.GetLocation(), member.Name)
        );
    }
}
