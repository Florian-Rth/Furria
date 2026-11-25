using System.Diagnostics.Contracts;
using Furria.Application.BeerList;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantMineFacts
{
    private const decimal CentsPerEuro = 100m;

    [Pure]
    public static MyThingsFact Of(
        IReadOnlyList<string> groupNames,
        IReadOnlyList<CalendarEntrySummary> entries,
        IReadOnlyList<AnnouncementSummary> announcements,
        string appUrl
    ) =>
        new(
            groupNames,
            [
                .. entries.Select(entry => OpenAnswerOf(entry, appUrl)).OfType<OpenAnswerFact>(),
                .. announcements
                    .Select(announcement => OpenAnswerOf(announcement, appUrl))
                    .OfType<OpenAnswerFact>(),
            ],
            [
                .. entries.Select(entry => OwnResponseOf(entry, appUrl)).OfType<OwnResponseFact>(),
                .. announcements
                    .Select(announcement => OwnResponseOf(announcement, appUrl))
                    .OfType<OwnResponseFact>(),
            ]
        );

    [Pure]
    public static BeerListFact BeerListOf(BeerPotDetails? openPot, BeerTabDetails tab)
    {
        var owing = tab.Pots.Where(pot => pot.OpenCrates > 0).ToList();

        return new BeerListFact(
            openPot is null
                ? null
                :
                [
                    .. openPot.Drinks.Select(drink => new BeerDrinkFact(
                        drink.Name,
                        EurosOf(drink.CratePriceCents),
                        drink.HasStock
                    )),
                ],
            owing.Sum(pot => pot.OpenCrates),
            EurosOf(owing.Sum(pot => pot.OpenCents)),
            [
                .. owing.Select(pot => new BeerTabFact(
                    pot.OpenCrates,
                    EurosOf(pot.OpenCents),
                    pot.PaymentLink
                )),
            ]
        );
    }

    [Pure]
    private static OwnResponseFact? OwnResponseOf(CalendarEntrySummary entry, string appUrl) =>
        entry.ViewerAnswer is { } answer
            ? new OwnResponseFact(
                entry.Title,
                ClubAssistantFacts.MomentOf(entry.StartsAt),
                ClubAssistantAddOnFacts.AnswerOf(answer),
                WhatsAppHostLinks.CalendarEntryOf(appUrl, entry.CalendarEntryId)
            )
            : null;

    [Pure]
    private static OwnResponseFact? OwnResponseOf(
        AnnouncementSummary announcement,
        string appUrl
    ) =>
        announcement.ViewerAnswer is { } answer
            ? new OwnResponseFact(
                announcement.Title,
                null,
                ClubAssistantAddOnFacts.AnswerOf(answer),
                WhatsAppHostLinks.AnnouncementOf(appUrl, announcement.AnnouncementId)
            )
            : null;

    [Pure]
    private static OpenAnswerFact? OpenAnswerOf(CalendarEntrySummary entry, string appUrl)
    {
        if (!entry.MayAnswer)
            return null;

        IReadOnlyList<string> open =
        [
            .. entry is { Attendance.IsClosed: false, ViewerAnswer: null }
                ? [ClubAssistantAddOnFacts.AttendanceKind]
                : Array.Empty<string>(),
            .. ClubAssistantAddOnFacts.KindsOf(
                entry
                    .OpenFunctions.Where(function => !function.HasAnswered)
                    .Select(function => function.Kind)
            ),
        ];

        return open.Count == 0
            ? null
            : new OpenAnswerFact(
                entry.Title,
                ClubAssistantFacts.MomentOf(entry.StartsAt),
                open,
                entry.CalendarEntryId,
                null,
                WhatsAppHostLinks.CalendarEntryOf(appUrl, entry.CalendarEntryId)
            );
    }

    [Pure]
    private static OpenAnswerFact? OpenAnswerOf(AnnouncementSummary announcement, string appUrl)
    {
        if (!announcement.ViewerMayAnswer)
            return null;

        IReadOnlyList<string> open = ClubAssistantAddOnFacts.KindsOf(
            announcement
                .AddOns.Where(addOn => IsOpenAndUnanswered(addOn, announcement.ViewerAnswer))
                .Select(addOn => addOn.Kind)
        );

        return open.Count == 0
            ? null
            : new OpenAnswerFact(
                announcement.Title,
                null,
                open,
                null,
                announcement.AnnouncementId,
                WhatsAppHostLinks.AnnouncementOf(appUrl, announcement.AnnouncementId)
            );
    }

    [Pure]
    private static bool IsOpenAndUnanswered(
        AnnouncementAddOnDetails addOn,
        AttendanceAnswer? viewerAnswer
    ) =>
        addOn switch
        {
            { Attendance.IsClosed: false } => viewerAnswer is null,
            { Poll: { IsClosed: false } poll } => !poll.Options.Any(option => option.ViewerChose),
            { SignUpList: { IsClosed: false } list } => !list.Lines.Any(line => line.ByViewer),
            _ => false,
        };

    [Pure]
    private static decimal EurosOf(int cents) => cents / CentsPerEuro;
}
