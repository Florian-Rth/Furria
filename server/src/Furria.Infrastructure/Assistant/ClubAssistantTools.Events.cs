using System.ComponentModel;
using Microsoft.Extensions.AI;

namespace Furria.Infrastructure.Assistant;

public sealed partial class ClubAssistantTools
{
    private const string NoRunningOrderResult =
        "Zu dieser Veranstaltung gibt es keinen veröffentlichten Ablauf.";
    private const string NoActsYetResult = "Für diese Veranstaltung steht noch kein Auftritt fest.";

    private IEnumerable<AIFunction> EventToolsFor(ClubAssistantAsker asker) =>
        [
            AIFunctionFactory.Create(
                EventsAsync,
                Events,
                "Kommende veröffentlichte Veranstaltungen: Datum, Einlass, Ort mit Adresse, "
                    + "Teaser, Preis, Kartenlage, Vorverkaufsbeginn und -stellen, Link, eventId."
            ),
            AIFunctionFactory.Create(
                (
                    [Description("eventId aus dem Werkzeug events.")] int eventId,
                    CancellationToken ct
                ) => RunningOrderAsync(asker, eventId, ct),
                RunningOrder,
                "Ablauf einer veröffentlichten Veranstaltung: die gesetzten Auftritte als Nummern "
                    + "in Reihenfolge, ohne Uhrzeiten. mayStillChange: Der Ablauf ist noch nicht "
                    + "bestätigt und kann sich ändern. isOwn: Auftritt der fragenden Person."
            ),
        ];

    private async Task<IReadOnlyList<EventFact>> EventsAsync(CancellationToken ct)
    {
        var facts = new List<EventFact>();
        foreach (var summary in await _eventService.GetPublicEventsAsync(ct))
        {
            if (await _eventService.GetPublicEventAsync(summary.EventId, ct) is { } details)
                facts.Add(ClubAssistantEventFacts.EventOf(details, AppUrl));
        }

        return facts;
    }

    private async Task<object> RunningOrderAsync(
        ClubAssistantAsker asker,
        int eventId,
        CancellationToken ct
    )
    {
        if (await _eventService.GetPublicEventAsync(eventId, ct) is not { } shown)
            return NoRunningOrderResult;

        var runningOrder = await _runningOrderService.GetEveningRunningOrderAsync(
            eventId,
            asker.PersonId,
            ct
        );
        return runningOrder.Lines.Count == 0
            ? NoActsYetResult
            : ClubAssistantEventFacts.RunningOrderOf(shown.Title, runningOrder);
    }
}
