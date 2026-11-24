using System.ComponentModel;
using Furria.Application.Club;
using Furria.Application.ClubApp;
using Furria.Infrastructure.Club;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantTools
{
    public const string ClubBasics = "club_basics";
    public const string CalendarEntries = "calendar_entries";
    public const string UsualTrainings = "usual_trainings";

    private const string FromDescription = "Erster Tag (yyyy-MM-dd), Vereinszeit.";
    private const string ToDescription = "Letzter Tag (yyyy-MM-dd), einschließlich.";

    private readonly ClubService _clubService;
    private readonly CalendarService _calendarService;
    private readonly UsualTrainingService _usualTrainingService;
    private readonly IOptions<ClubAppOptions> _clubApp;
    private readonly TimeProvider _timeProvider;

    public ClubAssistantTools(
        ClubService clubService,
        CalendarService calendarService,
        UsualTrainingService usualTrainingService,
        IOptions<ClubAppOptions> clubApp,
        TimeProvider timeProvider
    )
    {
        _clubService = clubService;
        _calendarService = calendarService;
        _usualTrainingService = usualTrainingService;
        _clubApp = clubApp;
        _timeProvider = timeProvider;
    }

    public IReadOnlyList<AIFunction> For(ClubAssistantAsker asker) =>
        [
            AIFunctionFactory.Create(
                ClubBasicsAsync,
                ClubBasics,
                "Name und Gründungsjahr des Vereins, die laufende Session mit Motto und "
                    + "das jetzige Datum mit Wochentag und Uhrzeit."
            ),
            AIFunctionFactory.Create(
                (
                    [Description(FromDescription)] DateOnly from,
                    [Description(ToDescription)] DateOnly to,
                    CancellationToken ct
                ) => CalendarEntriesAsync(asker, ClubAssistantWindow.Of(from, to), ct),
                CalendarEntries,
                "Kalendereinträge, die die fragende Person sieht: geplante Trainings, Termine, "
                    + "Ausflüge und Veranstaltungen mit Zeit, Ort, Veranstalter, Zielgruppe und "
                    + $"Link. Höchstens {ClubAssistantWindow.MostDays} Tage auf einmal."
            ),
            AIFunctionFactory.Create(
                (
                    [Description(FromDescription)] DateOnly from,
                    [Description(ToDescription)] DateOnly to,
                    CancellationToken ct
                ) => UsualTrainingsAsync(ClubAssistantWindow.Of(from, to), ct),
                UsualTrainings,
                "Übliche Trainingszeiten aller Gruppen als einzelne Termine im Zeitraum, ab heute: "
                    + "Gruppe, Tag, Beginn, Ende, Dauer, Ort. Tage mit einem geplanten Training "
                    + "der Gruppe fehlen hier, die stehen in den Kalendereinträgen."
            ),
        ];

    private async Task<ClubBasicsFact> ClubBasicsAsync(CancellationToken ct) =>
        ClubAssistantFacts.BasicsOf(
            await _clubService.GetPublicAsync(ct),
            _timeProvider.GetUtcNow()
        );

    private async Task<IReadOnlyList<CalendarEntryFact>> CalendarEntriesAsync(
        ClubAssistantAsker asker,
        ClubAssistantWindow window,
        CancellationToken ct
    )
    {
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
        return
        [
            .. entries.Select(entry => ClubAssistantFacts.EntryOf(entry, _clubApp.Value.BaseUrl)),
        ];
    }

    private async Task<IReadOnlyList<UsualTrainingFact>> UsualTrainingsAsync(
        ClubAssistantWindow window,
        CancellationToken ct
    ) =>
        [
            .. (
                await _usualTrainingService.GetUsualTrainingsBetweenAsync(
                    window.From,
                    window.To,
                    ct
                )
            ).Select(ClubAssistantFacts.UsualTrainingOf),
        ];
}
