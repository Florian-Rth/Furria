using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class NoAmbientClockAnalyzer : DiagnosticAnalyzer
{
    private static readonly ImmutableHashSet<string> ClockTypes = ImmutableHashSet.Create(
        "System.DateTime",
        "System.DateTimeOffset"
    );

    private static readonly ImmutableHashSet<string> ClockMembers = ImmutableHashSet.Create(
        "Now",
        "UtcNow"
    );

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.NoAmbientClock);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterCompilationStartAction(start =>
        {
            if (IsTestProject(start.Options))
                return;

            start.RegisterSyntaxNodeAction(Analyze, SyntaxKind.SimpleMemberAccessExpression);
        });
    }

    private static bool IsTestProject(AnalyzerOptions options) =>
        options.AnalyzerConfigOptionsProvider.GlobalOptions.TryGetValue(
            "build_property.IsTestProject",
            out var value
        ) && string.Equals(value, "true", StringComparison.OrdinalIgnoreCase);

    private static void Analyze(SyntaxNodeAnalysisContext context)
    {
        var access = (MemberAccessExpressionSyntax)context.Node;
        if (!ClockMembers.Contains(access.Name.Identifier.ValueText))
            return;

        if (
            context.SemanticModel.GetSymbolInfo(access).Symbol
            is not IPropertySymbol { IsStatic: true } property
        )
            return;

        var containingType = property.ContainingType?.ToDisplayString();
        if (containingType is null || !ClockTypes.Contains(containingType))
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(
                MetDiagnostics.NoAmbientClock,
                access.GetLocation(),
                $"{property.ContainingType!.Name}.{property.Name}"
            )
        );
    }
}
