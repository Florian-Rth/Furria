using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class NoStaticSerilogLogAnalyzer : DiagnosticAnalyzer
{
    private const string StaticLogType = "Serilog.Log";

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.NoStaticSerilogLog);

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
        var member = context.SemanticModel.GetSymbolInfo(access).Symbol;

        if (member?.ContainingType?.ToDisplayString() != StaticLogType)
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(MetDiagnostics.NoStaticSerilogLog, access.GetLocation(), member.Name)
        );
    }
}
