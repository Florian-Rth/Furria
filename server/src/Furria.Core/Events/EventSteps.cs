using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Core.Events;

public static class EventSteps
{
    private const int DetailsLeadDays = 90;
    private const int TicketsLeadDays = 60;
    private const int RunningOrderOpensDays = 28;
    private const int RunningOrderLeadDays = 14;
    private const int ReviewDaysAfter = 14;
    private const int FewestDaysSinceCreation = 14;

    [Pure]
    public static EventReadiness ReadinessOf(EventReadinessFacts facts, DateTimeOffset now)
    {
        var today = ClubClock.DayOf(now);
        IReadOnlyList<EventStepStatus> steps =
        [
            PreEventStatusOf(
                EventStep.Details,
                DetailsLeadDays,
                facts.AreDetailsDone,
                facts,
                today
            ),
            PreEventStatusOf(EventStep.Tickets, TicketsLeadDays, facts.AreTicketsSet, facts, today),
            RunningOrderStatusOf(facts, today),
            ReviewStatusOf(facts, today),
        ];

        return new EventReadiness(steps, facts.IsCancelled ? null : CurrentOf(steps, facts));
    }

    [Pure]
    private static EventStepStatus PreEventStatusOf(
        EventStep step,
        int leadDays,
        bool isDone,
        EventReadinessFacts facts,
        DateOnly today
    )
    {
        var dueOn = Earliest(DueOf(facts.EventDay.AddDays(-leadDays), facts), DayBefore(facts));
        var state =
            isDone ? EventStepState.Done
            : !facts.IsOver && today > dueOn ? EventStepState.Overdue
            : EventStepState.Open;

        return new EventStepStatus(step, state, dueOn, null);
    }

    [Pure]
    private static EventStepStatus RunningOrderStatusOf(EventReadinessFacts facts, DateOnly today)
    {
        var opensOn = facts.EventDay.AddDays(-RunningOrderOpensDays);
        var status = PreEventStatusOf(
            EventStep.RunningOrder,
            RunningOrderLeadDays,
            facts.IsRunningOrderDone,
            facts,
            today
        );
        var state =
            status.State != EventStepState.Done && today < opensOn
                ? EventStepState.Waiting
                : status.State;

        return status with
        {
            State = state,
            OpensOn = opensOn,
        };
    }

    [Pure]
    private static EventStepStatus ReviewStatusOf(EventReadinessFacts facts, DateOnly today)
    {
        var opensOn = facts.EventDay.AddDays(1);
        var dueOn = DueOf(facts.EventDay.AddDays(ReviewDaysAfter), facts);
        var state =
            facts.HasPublishedAlbum ? EventStepState.Done
            : today < opensOn ? EventStepState.Waiting
            : today > dueOn ? EventStepState.Overdue
            : EventStepState.Open;

        return new EventStepStatus(EventStep.Review, state, dueOn, opensOn);
    }

    [Pure]
    private static EventStep? CurrentOf(
        IReadOnlyList<EventStepStatus> steps,
        EventReadinessFacts facts
    )
    {
        var candidates = steps.Where(status => IsCandidate(status, facts)).ToList();
        var pick =
            EarliestDueIn(candidates, EventStepState.Overdue)
            ?? EarliestDueIn(candidates, EventStepState.Open);

        return pick?.Step;
    }

    [Pure]
    private static bool IsCandidate(EventStepStatus status, EventReadinessFacts facts) =>
        !facts.IsOver || status.Step == EventStep.Review;

    [Pure]
    private static EventStepStatus? EarliestDueIn(
        IEnumerable<EventStepStatus> steps,
        EventStepState state
    ) => steps.Where(status => status.State == state).MinBy(status => status.DueOn);

    [Pure]
    private static DateOnly DueOf(DateOnly plannedDue, EventReadinessFacts facts)
    {
        var earliestFair = facts.CreatedDay.AddDays(FewestDaysSinceCreation);

        return plannedDue > earliestFair ? plannedDue : earliestFair;
    }

    [Pure]
    private static DateOnly DayBefore(EventReadinessFacts facts) => facts.EventDay.AddDays(-1);

    [Pure]
    private static DateOnly Earliest(DateOnly first, DateOnly second) =>
        first < second ? first : second;
}
