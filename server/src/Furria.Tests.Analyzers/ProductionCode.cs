using Microsoft.CodeAnalysis.Diagnostics;

namespace Furria.Tests.Analyzers;

internal static class ProductionCode
{
    public static bool IsProductionCode(this AnalyzerOptions options) =>
        !(
            options.AnalyzerConfigOptionsProvider.GlobalOptions.TryGetValue(
                "build_property.IsTestProject",
                out var value
            ) && string.Equals(value, "true", StringComparison.OrdinalIgnoreCase)
        );
}
