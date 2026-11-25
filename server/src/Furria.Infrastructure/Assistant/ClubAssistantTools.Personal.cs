using System.ComponentModel;
using Furria.Application.Club;
using Furria.Core.Club;
using Microsoft.Extensions.AI;

namespace Furria.Infrastructure.Assistant;

public sealed partial class ClubAssistantTools
{
    private const string OneHostResult = "Gib genau eins an: calendarEntryId oder announcementId.";
    private const string UnknownHostResult =
        "Diesen Eintrag oder Aushang gibt es nicht oder die fragende Person sieht ihn nicht.";

    private IEnumerable<AIFunction> PersonalToolsFor(ClubAssistantAsker asker) =>
        [
            AIFunctionFactory.Create(
                (
                    CancellationToken ct,
                    [Description("calendarEntryId aus calendar_entries oder my_things.")]
                        int? calendarEntryId = null,
                    [Description("announcementId aus announcements oder my_things.")]
                        int? announcementId = null
                ) => AddOnsAsync(asker, new AddOnHostChoice(calendarEntryId, announcementId), ct),
                AddOns,
                "Alle Funktionen eines Kalendereintrags oder Aushangs: Zu-/Absage (Anzahl je "
                    + "Antwort), Umfragen (Stimmen je Option), Eintraglisten (Texte der Zeilen), "
                    + "Tagesablauf, Fristen, ob geschlossen, die eigene Antwort der fragenden Person "
                    + "(yourAnswer, chosenByYou, yourLine) und ob sie antworten darf. Wer geantwortet hat, "
                    + "steht nicht darin."
            ),
            AIFunctionFactory.Create(
                (CancellationToken ct) => MyThingsAsync(asker, ct),
                MyThings,
                "Das Eigene der fragenden Person: ihre Gruppen, offene Antworten (Zu-/Absagen, "
                    + "Umfragen, Eintraglisten, die sie noch beantworten kann) und ihre eigenen "
                    + $"Zu-/Absagen der nächsten {ClubAssistantWindow.MostDays} Tage und aktuellen "
                    + "Aushänge."
            ),
            AIFunctionFactory.Create(
                (CancellationToken ct) => BeerListAsync(asker, ct),
                BeerList,
                "Bierliste: Getränke mit Kastenpreis und ob vorrätig (nur für Teilnehmer der "
                    + "Bierliste) und die eigenen offenen Kästen und Beträge der fragenden Person, "
                    + "je Bierkasse mit Zahllink."
            ),
        ];

    private async Task<object> AddOnsAsync(
        ClubAssistantAsker asker,
        AddOnHostChoice host,
        CancellationToken ct
    ) =>
        host switch
        {
            { CalendarEntryId: { } calendarEntryId, AnnouncementId: null } =>
                await EntryAddOnsAsync(asker, calendarEntryId, ct) ?? (object)UnknownHostResult,
            { CalendarEntryId: null, AnnouncementId: { } announcementId } =>
                await AnnouncementAddOnsAsync(asker, announcementId, ct)
                    ?? (object)UnknownHostResult,
            _ => OneHostResult,
        };

    private async Task<AddOnsFact?> EntryAddOnsAsync(
        ClubAssistantAsker asker,
        int calendarEntryId,
        CancellationToken ct
    ) =>
        await _calendarService.GetEntrySeenByAsync(
            new CalendarEntrySightQuery
            {
                PersonId = asker.PersonId,
                Rights = asker.CalendarRights,
                CalendarEntryId = calendarEntryId,
            },
            ct
        )
            is { } entry
            ? ClubAssistantAddOnFacts.OfEntry(entry, AppUrl)
            : null;

    private async Task<AddOnsFact?> AnnouncementAddOnsAsync(
        ClubAssistantAsker asker,
        int announcementId,
        CancellationToken ct
    ) =>
        await _announcementService.GetCurrentAnnouncementSeenByAsync(
            SightOf(asker),
            announcementId,
            ct
        )
            is { } announcement
            ? ClubAssistantAddOnFacts.OfAnnouncement(announcement, AppUrl)
            : null;

    private async Task<MyThingsFact> MyThingsAsync(ClubAssistantAsker asker, CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);
        var window = ClubAssistantWindow.Of(today, today.AddDays(ClubAssistantWindow.MostDays));
        var entries = await _calendarService.GetEntriesSeenByAsync(
            new CalendarSightQuery
            {
                PersonId = asker.PersonId,
                Rights = asker.CalendarRights,
                From = window.From,
                To = window.To,
            },
            ct
        );

        return ClubAssistantMineFacts.Of(
            asker.GroupNames,
            entries,
            await CurrentAnnouncementsAsync(asker, ct),
            AppUrl
        );
    }

    private async Task<BeerListFact> BeerListAsync(ClubAssistantAsker asker, CancellationToken ct)
    {
        var pot = asker.TakesFromBeerList ? await _beerListService.GetOpenPotAsync(ct) : null;

        return ClubAssistantMineFacts.BeerListOf(
            pot,
            await _beerTabService.GetTabAsync(asker.PersonId, ct)
        );
    }

    private sealed record AddOnHostChoice(int? CalendarEntryId, int? AnnouncementId);
}
