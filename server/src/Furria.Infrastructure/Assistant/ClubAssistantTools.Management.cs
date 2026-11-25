using Furria.Application.Events;
using Microsoft.Extensions.AI;

namespace Furria.Infrastructure.Assistant;

public sealed partial class ClubAssistantTools
{
    private IEnumerable<AIFunction> ManagementToolsFor(ClubAssistantAsker asker)
    {
        if (asker.PreparesEvents)
            yield return AIFunctionFactory.Create(
                EventPreparationAsync,
                EventPreparation,
                "Veranstaltungen in Arbeit (auch noch nicht veröffentlichte oder abgesagte): "
                    + "Schritte der Vorbereitung (Eckdaten, Karten, Ablauf, Saal & Tische) mit "
                    + "Zustand und Fälligkeit, der aktuelle Schritt, fehlende Eckdaten, ob "
                    + "veröffentlicht, Link in die Veranstaltungsplanung."
            );

        if (asker.PlansRunningOrders)
            yield return AIFunctionFactory.Create(
                RunningOrderPlanningAsync,
                RunningOrderPlanning,
                "Planungsstand der Abläufe kommender Veranstaltungen: ob es einen Ablauf gibt, "
                    + "gesetzte und noch nicht gesetzte Auftritte, Anzahl Konflikte und Hinweise, "
                    + "ob bestätigt und ob seit der Bestätigung geändert, Link zum Ablauf."
            );

        if (asker.PlansHalls)
            yield return AIFunctionFactory.Create(
                TablePlansAsync,
                TablePlans,
                "Tischpläne kommender Veranstaltungen: ob einer nötig ist und vorliegt, Saal, "
                    + "Anzahl Tische und Stühle, Link zum Tischplan."
            );

        if (asker.MayHaveToDos)
            yield return AIFunctionFactory.Create(
                (CancellationToken ct) => MyToDosAsync(asker, ct),
                MyToDos,
                "Was wegen der Berechtigungen der fragenden Person zu erledigen ist, als Anzahl "
                    + "je Art (mit Gruppe beim Jeck-Check) und Link dorthin, wo es erledigt wird. "
                    + "Leer heißt: nichts zu erledigen."
            );
    }

    private async Task<IReadOnlyList<EventPreparationFact>> EventPreparationAsync(
        CancellationToken ct
    ) =>
        [
            .. (await _eventService.GetRelevantEventsAsync(ct))
                .Where(ClubAssistantManagementFacts.IsStillAhead)
                .Select(summary => ClubAssistantManagementFacts.PreparationOf(summary, AppUrl)),
        ];

    private async Task<IReadOnlyList<RunningOrderPlanningFact>> RunningOrderPlanningAsync(
        CancellationToken ct
    )
    {
        var facts = new List<RunningOrderPlanningFact>();
        foreach (var summary in await PlannedEventsAsync(ct))
        {
            facts.Add(
                ClubAssistantManagementFacts.PlanningOf(
                    summary,
                    await _runningOrderService.GetRunningOrderAsync(summary.EventId, ct),
                    AppUrl
                )
            );
        }

        return facts;
    }

    private async Task<IReadOnlyList<TablePlanFact>> TablePlansAsync(CancellationToken ct)
    {
        var events = (await PlannedEventsAsync(ct)).ToList();
        var hallNames = await _tablePlanService.HallNamesOfAsync(
            [.. events.Select(summary => summary.EventId)],
            ct
        );

        return
        [
            .. events.Select(summary =>
                ClubAssistantManagementFacts.TablePlanOf(
                    summary,
                    hallNames.GetValueOrDefault(summary.EventId),
                    AppUrl
                )
            ),
        ];
    }

    private async Task<IReadOnlyList<ToDoFact>> MyToDosAsync(
        ClubAssistantAsker asker,
        CancellationToken ct
    ) =>
        [
            .. (await _toDoService.ForViewerAsync(asker.ToDoViewer, ct)).Select(toDo =>
                ClubAssistantManagementFacts.ToDoOf(toDo, AppUrl)
            ),
        ];

    private async Task<IEnumerable<EventSummary>> PlannedEventsAsync(CancellationToken ct) =>
        (await _eventService.GetRelevantEventsAsync(ct)).Where(
            ClubAssistantManagementFacts.IsStillPlanned
        );
}
