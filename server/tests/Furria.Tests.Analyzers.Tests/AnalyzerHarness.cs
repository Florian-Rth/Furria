using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers.Tests;

// Self-contained harness: compiles a snippet against the full framework reference set and runs a
// single analyzer over it. Avoids the Microsoft.CodeAnalysis.*.Testing packages, which have no
// first-class xUnit v3 support.
internal static class AnalyzerHarness
{
    private static readonly ImmutableArray<MetadataReference> References = LoadReferences();

    public static async Task<ImmutableArray<Diagnostic>> RunAsync(
        DiagnosticAnalyzer analyzer,
        string source,
        bool isTestProject = false
    )
    {
        var compilation = CSharpCompilation.Create(
            "AnalyzerTestAssembly",
            [CSharpSyntaxTree.ParseText(source)],
            References,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)
        );

        var options = new AnalyzerOptions([], new TestOptionsProvider(isTestProject));

        var withAnalyzers = compilation.WithAnalyzers(ImmutableArray.Create(analyzer), options);

        return await withAnalyzers.GetAnalyzerDiagnosticsAsync();
    }

    public static async Task<ImmutableArray<Diagnostic>> RunForRuleAsync(
        DiagnosticAnalyzer analyzer,
        string ruleId,
        string source,
        bool isTestProject = false
    )
    {
        var diagnostics = await RunAsync(analyzer, source, isTestProject);
        return diagnostics.Where(d => d.Id == ruleId).ToImmutableArray();
    }

    private static ImmutableArray<MetadataReference> LoadReferences()
    {
        var trustedAssemblies = (string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!;
        return trustedAssemblies
            .Split(Path.PathSeparator)
            .Where(path => !string.IsNullOrEmpty(path))
            .Select(path => (MetadataReference)MetadataReference.CreateFromFile(path))
            .ToImmutableArray();
    }

    private sealed class TestOptionsProvider : AnalyzerConfigOptionsProvider
    {
        private readonly AnalyzerConfigOptions _global;

        public TestOptionsProvider(bool isTestProject)
        {
            _global = new TestConfigOptions(isTestProject);
        }

        public override AnalyzerConfigOptions GlobalOptions => _global;

        public override AnalyzerConfigOptions GetOptions(SyntaxTree tree) => _global;

        public override AnalyzerConfigOptions GetOptions(AdditionalText textFile) => _global;
    }

    private sealed class TestConfigOptions : AnalyzerConfigOptions
    {
        private readonly bool _isTestProject;

        public TestConfigOptions(bool isTestProject)
        {
            _isTestProject = isTestProject;
        }

        public override bool TryGetValue(string key, out string value)
        {
            if (key == "build_property.IsTestProject")
            {
                value = _isTestProject ? "true" : "false";
                return true;
            }

            value = string.Empty;
            return false;
        }
    }
}
