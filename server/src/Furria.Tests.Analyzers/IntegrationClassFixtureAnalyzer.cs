using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class IntegrationClassFixtureAnalyzer : DiagnosticAnalyzer
{
    private const string FixtureTypeName = "ApiTestFixture";
    private const string ClassFixtureInterface = "IClassFixture";
    private const string CollectionAttribute = "Collection";
    private const string CollectionAttributeFullName = "CollectionAttribute";

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.IntegrationClassFixture);

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

        if (OwnsApiFixture(declaration) && !JoinsCollection(declaration))
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(
                MetDiagnostics.IntegrationClassFixture,
                declaration.Identifier.GetLocation(),
                declaration.Identifier.ValueText
            )
        );
    }

    private static bool InjectsApiFixture(ClassDeclarationSyntax declaration) =>
        declaration
            .Members.OfType<ConstructorDeclarationSyntax>()
            .SelectMany(ctor => ctor.ParameterList.Parameters)
            .Any(parameter => parameter.Type is { } type && NamesApiFixture(type));

    private static bool OwnsApiFixture(ClassDeclarationSyntax declaration) =>
        declaration.BaseList?.Types.Any(baseType => IsApiClassFixture(baseType.Type)) == true;

    private static bool IsApiClassFixture(TypeSyntax type) =>
        UnqualifiedName(type) is GenericNameSyntax generic
        && generic.Identifier.ValueText == ClassFixtureInterface
        && generic.TypeArgumentList.Arguments.Count == 1
        && NamesApiFixture(generic.TypeArgumentList.Arguments[0]);

    private static bool JoinsCollection(ClassDeclarationSyntax declaration) =>
        declaration
            .AttributeLists.SelectMany(list => list.Attributes)
            .Any(attribute =>
                TestAttributes.SimpleName(attribute.Name)
                    is CollectionAttribute
                        or CollectionAttributeFullName
            );

    private static bool NamesApiFixture(TypeSyntax type) =>
        TestAttributes.SimpleName(NameOf(type)) == FixtureTypeName;

    private static SimpleNameSyntax? UnqualifiedName(TypeSyntax type) =>
        type switch
        {
            QualifiedNameSyntax qualified => qualified.Right,
            AliasQualifiedNameSyntax aliased => aliased.Name,
            SimpleNameSyntax simple => simple,
            _ => null,
        };

    private static NameSyntax NameOf(TypeSyntax type) =>
        type switch
        {
            NameSyntax name => name,
            _ => SyntaxFactory.IdentifierName(type.ToString()),
        };
}
