using FluentValidation;

namespace Furria.Api.Endpoints.News;

internal static class NewsRequestRules
{
    private const string MultilineMessage =
        "Titel, Vorspann und Bildunterschrift stehen jeweils in einer Zeile.";

    internal static IRuleBuilderOptions<T, string> SingleLine<T>(
        this IRuleBuilder<T, string> rule
    ) =>
        rule.Must(value => value?.IndexOfAny(['\r', '\n']) is null or < 0)
            .WithMessage(MultilineMessage);
}
