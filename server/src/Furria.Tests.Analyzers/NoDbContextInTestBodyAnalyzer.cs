using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

// MET005 — a `[Fact]`/`[Theory]` body must not touch a DbContext directly. Both forms are
// flagged: resolving one from the host (`GetRequiredService<XxxDbContext>()`) and declaring a
// local whose type is a DbContext. Seed and assert through the Tests.Common harness instead,
// which is never wired with this analyzer.
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class NoDbContextInTestBodyAnalyzer : DiagnosticAnalyzer
{
    private const string DbContextMetadataName = "Microsoft.EntityFrameworkCore.DbContext";

    private static readonly ImmutableHashSet<string> ResolutionMethods = ImmutableHashSet.Create(
        "GetRequiredService",
        "GetService",
        "GetRequiredKeyedService",
        "GetKeyedService"
    );

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.NoDbContextInTestBody);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterCompilationStartAction(start =>
        {
            var dbContextType = start.Compilation.GetTypeByMetadataName(DbContextMetadataName);
            if (dbContextType is null)
                return;

            start.RegisterSyntaxNodeAction(
                nodeContext => Analyze(nodeContext, dbContextType),
                SyntaxKind.MethodDeclaration
            );
        });
    }

    private static void Analyze(SyntaxNodeAnalysisContext context, INamedTypeSymbol dbContextType)
    {
        var method = (MethodDeclarationSyntax)context.Node;
        if (!TestAttributes.IsTestMethod(method))
            return;

        var body = (SyntaxNode?)method.Body ?? method.ExpressionBody;
        if (body is null)
            return;

        var name = method.Identifier.ValueText;
        foreach (var node in body.DescendantNodes())
        {
            if (!IsDbContextAccess(node, context.SemanticModel, dbContextType))
                continue;

            context.ReportDiagnostic(
                Diagnostic.Create(MetDiagnostics.NoDbContextInTestBody, node.GetLocation(), name)
            );
        }
    }

    private static bool IsDbContextAccess(
        SyntaxNode node,
        SemanticModel model,
        INamedTypeSymbol dbContextType
    )
    {
        switch (node)
        {
            case GenericNameSyntax generic
                when ResolutionMethods.Contains(generic.Identifier.ValueText):
                return generic.TypeArgumentList.Arguments.Any(argument =>
                    DerivesFromDbContext(
                        model.GetTypeInfo(argument).Type as INamedTypeSymbol,
                        dbContextType
                    )
                );

            case VariableDeclarationSyntax declaration when declaration.Type is not RefTypeSyntax:
                if (declaration.Type.IsVar)
                    return false;
                return DerivesFromDbContext(
                    model.GetTypeInfo(declaration.Type).Type as INamedTypeSymbol,
                    dbContextType
                );

            default:
                return false;
        }
    }

    private static bool DerivesFromDbContext(INamedTypeSymbol? type, INamedTypeSymbol dbContextType)
    {
        for (var current = type; current is not null; current = current.BaseType)
        {
            if (SymbolEqualityComparer.Default.Equals(current, dbContextType))
                return true;
        }

        return false;
    }
}
