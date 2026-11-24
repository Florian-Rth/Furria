using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class DanglingAliasAnalyzer : DiagnosticAnalyzer
{
    private const string OptOutAttribute = "SeedsAliases";

    private static readonly ImmutableHashSet<string> ResolutionMethods = ImmutableHashSet.Create(
        "IdOf",
        "ClientFor",
        "ClientForAsync",
        "EmailOf",
        "NameOf"
    );

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.DanglingAlias);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(Analyze, SyntaxKind.ClassDeclaration);
    }

    private static void Analyze(SyntaxNodeAnalysisContext context)
    {
        var type = (ClassDeclarationSyntax)context.Node;
        if (HasOptOut(type))
            return;

        var invocations = type.DescendantNodes()
            .OfType<InvocationExpressionSyntax>()
            .Where(invocation => NearestType(invocation) == type)
            .ToList();

        var declared = invocations
            .Where(invocation =>
                MethodName(invocation)?.StartsWith("Add", StringComparison.Ordinal) == true
            )
            .SelectMany(invocation => invocation.ArgumentList.Arguments)
            .Select(LiteralValue)
            .Where(value => value is not null)
            .ToImmutableHashSet()!;

        foreach (var invocation in invocations)
        {
            var name = MethodName(invocation);
            if (name is null || !ResolutionMethods.Contains(name))
                continue;

            var argument = invocation.ArgumentList.Arguments.FirstOrDefault();
            if (argument is null || LiteralValue(argument) is not { } alias)
                continue;

            if (declared.Contains(alias))
                continue;

            context.ReportDiagnostic(
                Diagnostic.Create(MetDiagnostics.DanglingAlias, argument.GetLocation(), alias, name)
            );
        }
    }

    private static bool HasOptOut(ClassDeclarationSyntax type) =>
        type
            .AttributeLists.SelectMany(list => list.Attributes)
            .Select(attribute => attribute.Name.ToString())
            .Any(name =>
                name.EndsWith(OptOutAttribute, StringComparison.Ordinal)
                || name.EndsWith($"{OptOutAttribute}Attribute", StringComparison.Ordinal)
            );

    private static TypeDeclarationSyntax? NearestType(SyntaxNode node) =>
        node.Ancestors().OfType<TypeDeclarationSyntax>().FirstOrDefault();

    private static string? MethodName(InvocationExpressionSyntax invocation) =>
        invocation.Expression switch
        {
            MemberAccessExpressionSyntax member => member.Name.Identifier.ValueText,
            IdentifierNameSyntax identifier => identifier.Identifier.ValueText,
            _ => null,
        };

    private static string? LiteralValue(ArgumentSyntax argument) =>
        argument.Expression is LiteralExpressionSyntax literal
        && literal.IsKind(SyntaxKind.StringLiteralExpression)
            ? literal.Token.ValueText
            : null;
}
