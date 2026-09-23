using System.Collections.Immutable;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Operations;

namespace Furria.Tests.Analyzers;

[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class LogTemplatePlaceholderAnalyzer : DiagnosticAnalyzer
{
    private const string NotPascalCase = "must be PascalCase";
    private const string NamesPersonalData =
        "names personal data; log the owning entity's id instead (ADR-0017)";

    private static readonly Regex Placeholder = new(
        @"(?<!\{)\{(?!\{)[@$]?(?<name>[^{}:,]*)[^{}]*\}",
        RegexOptions.Compiled
    );

    private static readonly Regex PascalCase = new(@"^[A-Z][A-Za-z0-9]*$", RegexOptions.Compiled);

    private static readonly ImmutableArray<string> PersonalDataSuffixes = ImmutableArray.Create(
        "FirstName",
        "LastName",
        "FullName",
        "DisplayName",
        "UserName",
        "Phone",
        "PhoneNumber",
        "Street",
        "Zip",
        "City",
        "Address",
        "BirthDate",
        "Body",
        "Password",
        "Token",
        "Hash",
        "Secret"
    );

    private static readonly ImmutableArray<TemplateParameter> TemplateParameters =
        ImmutableArray.Create(
            new TemplateParameter("Microsoft.Extensions.Logging", "message"),
            new TemplateParameter("Serilog", "messageTemplate")
        );

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(MetDiagnostics.LogTemplatePlaceholder);

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterCompilationStartAction(start =>
        {
            if (start.Options.IsProductionCode())
                start.RegisterOperationAction(Analyze, OperationKind.Invocation);
        });
    }

    private static void Analyze(OperationAnalysisContext context)
    {
        var invocation = (IInvocationOperation)context.Operation;
        var template = invocation.Arguments.FirstOrDefault(IsTemplateArgument);

        if (template?.Value.ConstantValue.Value is not string text)
            return;

        foreach (Match placeholder in Placeholder.Matches(text))
            Report(context, template, placeholder.Groups["name"].Value);
    }

    private static void Report(
        OperationAnalysisContext context,
        IArgumentOperation template,
        string name
    )
    {
        var problem = ProblemOf(name);
        if (problem is null)
            return;

        context.ReportDiagnostic(
            Diagnostic.Create(
                MetDiagnostics.LogTemplatePlaceholder,
                template.Syntax.GetLocation(),
                name,
                problem
            )
        );
    }

    private static string? ProblemOf(string name)
    {
        if (!PascalCase.IsMatch(name))
            return NotPascalCase;

        return PersonalDataSuffixes.Any(suffix => name.EndsWith(suffix, StringComparison.Ordinal))
            ? NamesPersonalData
            : null;
    }

    private static bool IsTemplateArgument(IArgumentOperation argument)
    {
        var parameter = argument.Parameter;
        var ns = parameter?.ContainingSymbol.ContainingNamespace?.ToDisplayString();

        return parameter is not null
            && ns is not null
            && TemplateParameters.Any(candidate => candidate.Matches(ns, parameter.Name));
    }

    private sealed class TemplateParameter
    {
        private readonly string _namespacePrefix;
        private readonly string _parameterName;

        public TemplateParameter(string namespacePrefix, string parameterName)
        {
            _namespacePrefix = namespacePrefix;
            _parameterName = parameterName;
        }

        public bool Matches(string ns, string parameterName) =>
            parameterName == _parameterName
            && (
                ns == _namespacePrefix
                || ns.StartsWith(_namespacePrefix + ".", StringComparison.Ordinal)
            );
    }
}
