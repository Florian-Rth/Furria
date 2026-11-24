using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Furria.Tests.Analyzers;

internal static class TestAttributes
{
    public static bool IsTestMethod(MethodDeclarationSyntax method) =>
        method.AttributeLists.SelectMany(list => list.Attributes).Any(IsFactOrTheory);

    public static bool IsFactOrTheory(AttributeSyntax attribute)
    {
        var name = SimpleName(attribute.Name);
        return name is "Fact" or "FactAttribute" or "Theory" or "TheoryAttribute";
    }

    public static string SimpleName(NameSyntax name) =>
        name switch
        {
            QualifiedNameSyntax qualified => qualified.Right.Identifier.ValueText,
            SimpleNameSyntax simple => simple.Identifier.ValueText,
            _ => name.ToString(),
        };
}
