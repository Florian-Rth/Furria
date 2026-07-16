using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace MyProduct.Tests.Analyzers;

// MET004 — a test class that consumes the integration host (injects `ApiTestFixture` through its
// constructor) must carry the `[Collection("Api")]` marker so it shares the single container and
// the per-class reset hook. Scoping the rule to ApiTestFixture injection keeps pure unit-test
// projects out of scope (no false positives).
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class IntegrationCollectionMarkerAnalyzer : DiagnosticAnalyzer
{
    private const string FixtureTypeName = "ApiTestFixture";
    private const string CollectionAttribute = "Collection";
    private const string ApiCollectionName = "Api";

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.IntegrationCollectionMarker);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(Analyze, SyntaxKind.ClassDeclaration);
    }

    private static void Analyze(SyntaxNodeAnalysisContext context)
    {
        var declaration = (ClassDeclarationSyntax)context.Node;
        if (!InjectsApiFixture(declaration))
            return;

        if (HasApiCollectionMarker(declaration))
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(
                MetDiagnostics.IntegrationCollectionMarker,
                declaration.Identifier.GetLocation(),
                declaration.Identifier.ValueText
            )
        );
    }

    private static bool InjectsApiFixture(ClassDeclarationSyntax declaration) =>
        declaration
            .Members.OfType<ConstructorDeclarationSyntax>()
            .SelectMany(ctor => ctor.ParameterList.Parameters)
            .Any(parameter =>
                parameter.Type is { } type
                && TestAttributes.SimpleName(NameOf(type)) == FixtureTypeName
            );

    private static bool HasApiCollectionMarker(ClassDeclarationSyntax declaration) =>
        declaration
            .AttributeLists.SelectMany(list => list.Attributes)
            .Any(attribute =>
                TestAttributes.SimpleName(attribute.Name) == CollectionAttribute
                && attribute.ArgumentList?.Arguments.Any(argument =>
                    argument.Expression is LiteralExpressionSyntax literal
                    && literal.Token.ValueText == ApiCollectionName
                ) == true
            );

    private static NameSyntax NameOf(TypeSyntax type) =>
        type switch
        {
            NameSyntax name => name,
            _ => SyntaxFactory.IdentifierName(type.ToString()),
        };
}
