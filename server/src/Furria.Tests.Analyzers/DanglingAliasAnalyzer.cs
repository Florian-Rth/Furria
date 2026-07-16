using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

// MET007 — an alias resolved via IdOf("x")/ClientFor("x")/NameOf("x") must be declared by an Add*
// builder call somewhere in the same class. Conservative and purely syntactic: every string literal
// handed to an Add* method anywhere in the type counts as a declaration, so the rule only fires on a
// genuine typo, never on an alias the builder did register.
//
// Resolution is class-scope: a test that seeds in one helper method and resolves
// in another — common once arrange logic is extracted — no longer false-positives. A class whose
// aliases are seeded by a helper in a *different* class (which the analyzer can't follow) opts out
// with the [SeedsAliases] marker.
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class DanglingAliasAnalyzer : DiagnosticAnalyzer
{
    private const string OptOutAttribute = "SeedsAliases";

    private static readonly ImmutableHashSet<string> ResolutionMethods = ImmutableHashSet.Create(
        "IdOf",
        "ClientFor",
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

        // Only invocations owned directly by this class (not by a nested type, which fires its own
        // ClassDeclaration analysis) so a nested type's aliases neither leak in nor double-report.
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
