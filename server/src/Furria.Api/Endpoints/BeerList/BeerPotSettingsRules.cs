using System.Diagnostics.CodeAnalysis;
using System.Diagnostics.Contracts;
using FluentValidation;
using Furria.Application.BeerList;
using Furria.Core.BeerList;

namespace Furria.Api.Endpoints.BeerList;

internal static class BeerPotSettingsRules
{
    private const string CratePriceMessage = "Der Kistenpreis liegt zwischen 0,01 € und 100 €.";
    private const string PaymentLinkMessage =
        "Der PayPal-Link sieht aus wie https://paypal.me/deinname.";
    private const string PaymentLinkTooLongMessage = "Der PayPal-Link ist zu lang.";

    private static readonly string DrinkNameMessage =
        $"Der Name des Getränks hat 1 bis {BeerDrink.NameLength} Zeichen.";

    internal static IRuleBuilderOptions<T, int> CratePrice<T>(this IRuleBuilder<T, int> rule) =>
        rule.InclusiveBetween(1, BeerPotDrink.MaxCratePriceCents).WithMessage(CratePriceMessage);

    internal static IRuleBuilderOptions<T, string?> PaymentLink<T>(
        this IRuleBuilder<T, string?> rule
    ) =>
        rule.Must(link => Blank(link) || PayPalLink.IsValid(link.Trim()))
            .WithMessage(PaymentLinkMessage)
            .Must(link => Blank(link) || link.Trim().Length <= BeerPot.PaymentLinkLength)
            .WithMessage(PaymentLinkTooLongMessage);

    internal static IRuleBuilderOptions<T, string> DrinkName<T>(
        this IRuleBuilder<T, string> rule
    ) =>
        rule.Must(name => !Blank(name) && name.Trim().Length <= BeerDrink.NameLength)
            .WithMessage(DrinkNameMessage);

    [Pure]
    internal static string? ToPaymentLink(string? paymentLink) => Trimmed(paymentLink);

    [Pure]
    internal static BeerDrinkSettings ToDrinkSettings(string name, int cratePriceCents) =>
        new() { Name = name.Trim(), CratePriceCents = cratePriceCents };

    [Pure]
    internal static string NameKey(string name) => name.Trim().ToLowerInvariant();

    [Pure]
    private static bool Blank([NotNullWhen(false)] string? value) =>
        string.IsNullOrWhiteSpace(value);

    [Pure]
    private static string? Trimmed(string? value) => Blank(value) ? null : value.Trim();
}
