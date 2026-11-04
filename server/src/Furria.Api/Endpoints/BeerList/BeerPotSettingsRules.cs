using System.Diagnostics.CodeAnalysis;
using System.Diagnostics.Contracts;
using FluentValidation;
using Furria.Application.BeerList;
using Furria.Core.BeerList;

namespace Furria.Api.Endpoints.BeerList;

internal static class BeerPotSettingsRules
{
    internal const string PaymentDetailsField = "paymentDetails";
    internal const string MissingPaymentDetailsMessage =
        "Gib einen PayPal-Link oder einen Zahlungshinweis an, damit alle wissen, wie sie zahlen.";

    private const string CratePriceMessage = "Der Kistenpreis liegt zwischen 0,01 € und 100 €.";
    private const string PaymentLinkMessage =
        "Der PayPal-Link sieht aus wie https://paypal.me/deinname.";
    private const string PaymentLinkTooLongMessage = "Der PayPal-Link ist zu lang.";
    private const string PaymentNoteTooLongMessage =
        "Der Zahlungshinweis hat höchstens 500 Zeichen.";

    internal static IRuleBuilderOptions<T, int> CratePrice<T>(this IRuleBuilder<T, int> rule) =>
        rule.InclusiveBetween(1, BeerPot.MaxCratePriceCents).WithMessage(CratePriceMessage);

    internal static IRuleBuilderOptions<T, string?> PaymentLink<T>(
        this IRuleBuilder<T, string?> rule
    ) =>
        rule.Must(link => Blank(link) || PayPalLink.IsValid(link.Trim()))
            .WithMessage(PaymentLinkMessage)
            .Must(link => Blank(link) || link.Trim().Length <= BeerPot.PaymentLinkLength)
            .WithMessage(PaymentLinkTooLongMessage);

    internal static IRuleBuilderOptions<T, string?> PaymentNote<T>(
        this IRuleBuilder<T, string?> rule
    ) =>
        rule.Must(note => Blank(note) || note.Trim().Length <= BeerPot.PaymentNoteLength)
            .WithMessage(PaymentNoteTooLongMessage);

    [Pure]
    internal static bool NamesPaymentDetails(string? paymentLink, string? paymentNote) =>
        !Blank(paymentLink) || !Blank(paymentNote);

    [Pure]
    internal static BeerPotSettings ToSettings(
        int cratePriceCents,
        string? paymentLink,
        string? paymentNote
    ) =>
        new()
        {
            CratePriceCents = cratePriceCents,
            PaymentLink = Trimmed(paymentLink),
            PaymentNote = Trimmed(paymentNote),
        };

    [Pure]
    private static bool Blank([NotNullWhen(false)] string? value) =>
        string.IsNullOrWhiteSpace(value);

    [Pure]
    private static string? Trimmed(string? value) => Blank(value) ? null : value.Trim();
}
