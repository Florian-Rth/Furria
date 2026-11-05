using Furria.Core.Events;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class EventStepsTests
{
    private const EventStepState Done = EventStepState.Done;
    private const EventStepState Overdue = EventStepState.Overdue;
    private const EventStepState Open = EventStepState.Open;
    private const EventStepState Waiting = EventStepState.Waiting;

    private static readonly DateOnly GalaDay = new(2027, 1, 16);

    private static readonly EventReadinessFacts NothingDone = new()
    {
        EventDay = GalaDay,
        CreatedDay = new DateOnly(2026, 9, 1),
        IsCancelled = false,
        IsOver = false,
        AreDetailsDone = false,
        AreTicketsSet = false,
        IsRunningOrderDone = false,
        NeedsTablePlan = false,
        HasPlacedTables = false,
    };

    [Theory]
    [InlineData("2026-09-01", "2026-10-18", "2026-11-17", "2027-01-02")]
    [InlineData("2026-11-01", "2026-11-15", "2026-11-17", "2027-01-02")]
    [InlineData("2026-12-25", "2027-01-08", "2027-01-08", "2027-01-08")]
    [InlineData("2027-01-10", "2027-01-15", "2027-01-15", "2027-01-15")]
    public void Should_GiveEveryStepTimeSinceItsCreation_When_TheEventWasCreatedLate(
        string createdOn,
        string detailsDue,
        string ticketsDue,
        string runningOrderDue
    )
    {
        var readiness = EventSteps.ReadinessOf(
            NothingDone with
            {
                CreatedDay = DateOnly.Parse(createdOn),
            },
            Noon("2026-09-01")
        );

        Assert.Equal(
            [
                DateOnly.Parse(detailsDue),
                DateOnly.Parse(ticketsDue),
                DateOnly.Parse(runningOrderDue),
            ],
            readiness.Steps.Select(status => status.DueOn)
        );
    }

    [Fact]
    public void Should_OpenTheRunningOrderLater_When_TheStepsAreListed()
    {
        var readiness = EventSteps.ReadinessOf(NothingDone, Noon("2026-10-01"));

        Assert.Equal(
            [
                new EventStepStatus(EventStep.Details, Open, new DateOnly(2026, 10, 18), null),
                new EventStepStatus(EventStep.Tickets, Open, new DateOnly(2026, 11, 17), null),
                new EventStepStatus(
                    EventStep.RunningOrder,
                    Waiting,
                    new DateOnly(2027, 1, 2),
                    new DateOnly(2026, 12, 19)
                ),
            ],
            readiness.Steps
        );
    }

    [Theory]
    [InlineData("2026-10-01", false, false, false, Open, Open, Waiting, EventStep.Details)]
    [InlineData("2026-10-18", false, false, false, Open, Open, Waiting, EventStep.Details)]
    [InlineData("2026-10-19", false, false, false, Overdue, Open, Waiting, EventStep.Details)]
    [InlineData("2026-11-20", false, false, false, Overdue, Overdue, Waiting, EventStep.Details)]
    [InlineData("2026-11-20", true, false, false, Done, Overdue, Waiting, EventStep.Tickets)]
    [InlineData("2026-10-01", true, false, false, Done, Open, Waiting, EventStep.Tickets)]
    [InlineData("2026-10-01", true, true, false, Done, Done, Waiting, null)]
    [InlineData("2026-12-18", true, true, false, Done, Done, Waiting, null)]
    [InlineData("2026-12-19", true, true, false, Done, Done, Open, EventStep.RunningOrder)]
    [InlineData("2027-01-02", true, true, false, Done, Done, Open, EventStep.RunningOrder)]
    [InlineData("2027-01-03", true, true, false, Done, Done, Overdue, EventStep.RunningOrder)]
    [InlineData("2027-01-03", false, true, false, Overdue, Done, Overdue, EventStep.Details)]
    [InlineData("2026-12-01", true, true, true, Done, Done, Done, null)]
    [InlineData("2027-01-03", true, true, true, Done, Done, Done, null)]
    public void Should_PickOneCurrentStep_When_TheStepsStandAsGiven(
        string today,
        bool detailsDone,
        bool ticketsSet,
        bool runningOrderDone,
        EventStepState details,
        EventStepState tickets,
        EventStepState runningOrder,
        EventStep? current
    )
    {
        var readiness = EventSteps.ReadinessOf(
            NothingDone with
            {
                AreDetailsDone = detailsDone,
                AreTicketsSet = ticketsSet,
                IsRunningOrderDone = runningOrderDone,
                IsOver = DateOnly.Parse(today) > GalaDay,
            },
            Noon(today)
        );

        Assert.Equal(
            [details, tickets, runningOrder],
            readiness.Steps.Select(status => status.State)
        );
        Assert.Equal(current, readiness.CurrentStep);
    }

    [Fact]
    public void Should_LeaveNoCurrentStep_When_TheEveningIsOver()
    {
        var readiness = EventSteps.ReadinessOf(
            NothingDone with
            {
                IsOver = true,
            },
            Noon("2027-02-01")
        );

        Assert.All(readiness.Steps, status => Assert.NotEqual(Overdue, status.State));
        Assert.Null(readiness.CurrentStep);
    }

    [Fact]
    public void Should_LeaveNoCurrentStep_When_TheEventIsCancelled()
    {
        var readiness = EventSteps.ReadinessOf(
            NothingDone with
            {
                IsCancelled = true,
            },
            Noon("2026-11-20")
        );

        Assert.Null(readiness.CurrentStep);
    }

    [Fact]
    public void Should_ListTheHallStepDueThreeWeeksAhead_When_TheEventNeedsATablePlan()
    {
        var readiness = EventSteps.ReadinessOf(
            NothingDone with
            {
                NeedsTablePlan = true,
            },
            Noon("2026-10-01")
        );

        Assert.Equal(
            new EventStepStatus(EventStep.Hall, Open, new DateOnly(2026, 12, 26), null),
            readiness.Steps[^1]
        );
    }

    [Theory]
    [InlineData("2026-11-11", "2026-11-10")]
    [InlineData("2026-12-01", "2026-11-18")]
    [InlineData("2027-01-16", "2026-12-26")]
    public void Should_GiveTheHallStepTimeSinceItArrived_When_TheEventIsOlderThanTheStep(
        string eventDay,
        string hallDue
    )
    {
        var readiness = EventSteps.ReadinessOf(
            NothingDone with
            {
                EventDay = DateOnly.Parse(eventDay),
                CreatedDay = new DateOnly(2026, 1, 1),
                NeedsTablePlan = true,
            },
            Noon("2026-11-05")
        );

        var hall = readiness.Steps.Single(status => status.Step == EventStep.Hall);
        Assert.Equal(
            new EventStepStatus(EventStep.Hall, Open, DateOnly.Parse(hallDue), null),
            hall
        );
    }

    [Fact]
    public void Should_DropTheHallStep_When_NoTablePlanIsNeeded()
    {
        var readiness = EventSteps.ReadinessOf(NothingDone, Noon("2026-10-01"));

        Assert.DoesNotContain(readiness.Steps, status => status.Step == EventStep.Hall);
    }

    [Theory]
    [InlineData("2026-12-26", false, false, Open, EventStep.Hall)]
    [InlineData("2026-12-27", false, false, Overdue, EventStep.Hall)]
    [InlineData("2026-12-27", true, false, Done, null)]
    [InlineData("2027-01-03", false, false, Overdue, EventStep.Hall)]
    [InlineData("2027-01-03", false, true, Overdue, EventStep.Hall)]
    [InlineData("2027-01-03", true, true, Done, EventStep.RunningOrder)]
    [InlineData("2027-02-01", false, false, Open, null)]
    public void Should_TreatTheHallStepLikeTheOtherSteps_When_TheEventNeedsATablePlan(
        string today,
        bool hasPlacedTables,
        bool isAfterRunningOrderDue,
        EventStepState hall,
        EventStep? current
    )
    {
        var readiness = EventSteps.ReadinessOf(
            NothingDone with
            {
                AreDetailsDone = true,
                AreTicketsSet = true,
                IsRunningOrderDone = !isAfterRunningOrderDue,
                NeedsTablePlan = true,
                HasPlacedTables = hasPlacedTables,
                IsOver = DateOnly.Parse(today) > GalaDay,
            },
            Noon(today)
        );

        Assert.Equal(hall, readiness.Steps.Single(status => status.Step == EventStep.Hall).State);
        Assert.Equal(current, readiness.CurrentStep);
    }

    private static DateTimeOffset Noon(string day) =>
        new(DateOnly.Parse(day).ToDateTime(new TimeOnly(12, 0)), TimeSpan.Zero);
}
