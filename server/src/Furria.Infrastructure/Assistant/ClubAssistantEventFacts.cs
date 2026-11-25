using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Events;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantEventFacts
{
    private static readonly CultureInfo German = CultureInfo.GetCultureInfo("de-DE");

    [Pure]
    public static EventFact EventOf(PublicEventDetails details, string appUrl) =>
        new(
            details.EventId,
            details.Title,
            ClubAssistantFacts.MomentOf(details.StartsAt),
            details.EndsAt is { } endsAt ? ClubAssistantFacts.MomentOf(endsAt) : null,
            details.DoorsOpenAt is { } doorsOpenAt
                ? ClubAssistantFacts.TimeOf(ClubClock.TimeOf(doorsOpenAt))
                : null,
            details.Venue.Name,
            ClubAssistantFacts.AddressOf(
                details.Venue.Street,
                details.Venue.Zip,
                details.Venue.City
            ),
            details.Teaser,
            details.AgeHint,
            details.PriceCents is { } cents ? PriceOf(cents) : null,
            TicketsOf(details.Status),
            details.PresaleStartsAt is { } presaleStartsAt
                ? ClubAssistantFacts.MomentOf(presaleStartsAt)
                : null,
            [.. details.PresalePlaces.Select(PresalePlaceOf)],
            WhatsAppHostLinks.CalendarEntryOf(appUrl, details.EventId)
        );

    [Pure]
    public static RunningOrderFact RunningOrderOf(
        string eventTitle,
        EveningRunningOrderDetails runningOrder
    ) =>
        new(
            eventTitle,
            runningOrder.IsConfirmed,
            !runningOrder.IsConfirmed,
            [
                .. runningOrder.Lines.Select(line => new RunningOrderActFact(
                    line.Position + 1,
                    line.Name,
                    line.Kind is { } kind ? ActKindOf(kind) : null,
                    line.Group?.Name,
                    line.IsOwn
                )),
            ]
        );

    [Pure]
    private static PresalePlaceFact PresalePlaceOf(PublicPresalePlace place) =>
        new(
            place.Name,
            ClubAssistantFacts.AddressOf(place.Street, place.Zip, place.City),
            place.Hint,
            ClubAssistantFacts.OpeningHoursOf(place.OpeningHours)
        );

    [Pure]
    private static string PriceOf(int cents) => string.Create(German, $"{cents / 100m:0.00} €");

    [Pure]
    private static string TicketsOf(EventSalesStatus status) =>
        status switch
        {
            EventSalesStatus.Announced => "angekündigt, Vorverkauf noch ohne Termin",
            EventSalesStatus.PresaleScheduled => "Vorverkauf beginnt bald",
            EventSalesStatus.Available => "Karten erhältlich",
            EventSalesStatus.FewLeft => "nur noch wenige Karten",
            EventSalesStatus.SoldOut => "ausverkauft",
            EventSalesStatus.Cancelled => "abgesagt",
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, null),
        };

    [Pure]
    private static string ActKindOf(ActKind kind) =>
        kind switch
        {
            ActKind.Dance => "Tanz",
            ActKind.Speech => "Rede",
            ActKind.Music => "Musik",
            ActKind.Show => "Show",
            ActKind.Point => "Ablaufpunkt",
            _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
        };
}
