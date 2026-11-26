using System.Diagnostics.Contracts;
using Furria.Application.Events;
using Furria.Application.Management;
using Furria.Application.RunningOrders;
using Furria.Core.Events;
using Furria.Core.RunningOrders;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantManagementFacts
{
    [Pure]
    public static bool IsStillAhead(EventSummary summary) => !summary.IsOver;

    [Pure]
    public static bool IsStillPlanned(EventSummary summary) =>
        !summary.IsOver && summary.Status != EventSalesStatus.Cancelled;

    [Pure]
    public static EventPreparationFact PreparationOf(EventSummary summary, string appUrl) =>
        new(
            summary.EventId,
            summary.Title,
            ClubAssistantFacts.MomentOf(summary.StartsAt),
            summary.VenueName,
            summary.PublishedAt is not null,
            summary.Status == EventSalesStatus.Cancelled,
            CurrentStepOf(summary.Planning.Readiness),
            StepsOf(summary.Planning.Readiness),
            MissingDetailsOf(summary.Planning),
            ClubAssistantManagementLinks.EventOf(appUrl, summary.EventId)
        );

    [Pure]
    public static RunningOrderPlanningFact PlanningOf(
        EventSummary summary,
        RunningOrderDetails? runningOrder,
        string appUrl
    ) =>
        new(
            summary.EventId,
            summary.Title,
            ClubAssistantFacts.MomentOf(summary.StartsAt),
            runningOrder is not null,
            runningOrder?.Lines.Count(line => line.Position is not null) ?? 0,
            runningOrder?.Lines.Count(line => line.Position is null) ?? 0,
            runningOrder?.Findings.Count(IsConflict) ?? 0,
            runningOrder?.Findings.Count(IsHintBeyondPlacing) ?? 0,
            runningOrder is { ConfirmedAt: not null, ChangedSinceConfirmed: false },
            runningOrder?.ChangedSinceConfirmed ?? false,
            ClubAssistantManagementLinks.RunningOrderOf(appUrl, summary.EventId)
        );

    [Pure]
    public static TablePlanFact TablePlanOf(EventSummary summary, string? hall, string appUrl) =>
        TablePlanOf(summary, summary.Planning, hall, appUrl);

    [Pure]
    public static ToDoFact ToDoOf(ToDoSummary toDo, string appUrl) =>
        new(
            ToDoKindOf(toDo.Kind),
            toDo.Count,
            toDo.Group?.Name,
            ClubAssistantManagementLinks.ToDoOf(appUrl, toDo)
        );

    [Pure]
    private static TablePlanFact TablePlanOf(
        EventSummary summary,
        EventPlanning planning,
        string? hall,
        string appUrl
    ) =>
        new(
            summary.EventId,
            summary.Title,
            ClubAssistantFacts.MomentOf(summary.StartsAt),
            !planning.WithoutTablePlan,
            planning.TablePlan is not null,
            hall,
            planning.TablePlan?.Tables ?? 0,
            planning.TablePlan?.Chairs ?? 0,
            ClubAssistantManagementLinks.TablePlanOf(appUrl, summary.EventId)
        );

    [Pure]
    private static string? CurrentStepOf(EventReadiness readiness) =>
        readiness.CurrentStep is { } current ? StepOf(current) : null;

    [Pure]
    private static IReadOnlyList<EventStepFact> StepsOf(EventReadiness readiness) =>
        [.. readiness.Steps.Select(StepStatusOf)];

    [Pure]
    private static IReadOnlyList<string> MissingDetailsOf(EventPlanning planning) =>
        [.. planning.DetailsMissing.Select(MissingDetailOf)];

    [Pure]
    private static bool IsConflict(RunningOrderFindingDetails finding) =>
        finding.Severity == FindingSeverity.Conflict;

    [Pure]
    private static bool IsHintBeyondPlacing(RunningOrderFindingDetails finding) =>
        finding.Severity == FindingSeverity.Hint && finding.Kind != FindingKind.Unplaced;

    [Pure]
    private static EventStepFact StepStatusOf(EventStepStatus status) =>
        new(
            StepOf(status.Step),
            StateOf(status.State),
            ClubAssistantFacts.DayOf(status.DueOn),
            status.OpensOn is { } opensOn ? ClubAssistantFacts.DayOf(opensOn) : null
        );

    [Pure]
    private static string StepOf(EventStep step) =>
        step switch
        {
            EventStep.Details => "Eckdaten",
            EventStep.Tickets => "Karten",
            EventStep.RunningOrder => "Ablauf",
            EventStep.Hall => "Saal & Tische",
            _ => throw new ArgumentOutOfRangeException(nameof(step), step, null),
        };

    [Pure]
    private static string StateOf(EventStepState state) =>
        state switch
        {
            EventStepState.Done => "erledigt",
            EventStepState.Overdue => "überfällig",
            EventStepState.Open => "offen",
            EventStepState.Waiting => "noch nicht dran",
            _ => throw new ArgumentOutOfRangeException(nameof(state), state, null),
        };

    [Pure]
    private static string MissingDetailOf(MissingEventDetail detail) =>
        detail switch
        {
            MissingEventDetail.Venue => "Ort",
            MissingEventDetail.DoorsOpenAt => "Einlass",
            MissingEventDetail.Description => "Beschreibung",
            MissingEventDetail.Picture => "Veranstaltungsbild",
            MissingEventDetail.Published => "Veröffentlichung",
            _ => throw new ArgumentOutOfRangeException(nameof(detail), detail, null),
        };

    [Pure]
    private static string ToDoKindOf(ToDoKind kind) =>
        kind switch
        {
            ToDoKind.NeverInvited => "nie eingeladen",
            ToDoKind.ReminderDue => "Erinnerung fällig",
            ToDoKind.InPersonOnly => "nur vor Ort einladbar",
            ToDoKind.BirthDateUnknown => "Geburtsdatum fehlt",
            ToDoKind.KeyToTakeBack => "Schlüssel zurückholen",
            ToDoKind.ClubRecordGap => "Lücke in Vereinsdaten",
            ToDoKind.ApplicationWaiting => "Beitrittsantrag offen",
            ToDoKind.GroupMatcherStatementsOpen => "Jeck-Check: Aussagen ohne Haltung der Gruppe",
            _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
        };
}
