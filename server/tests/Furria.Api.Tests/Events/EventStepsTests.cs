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
        HasPublishedAlbum = false,
    };

    [Theory]
    [InlineData("2026-09-01", "2026-10-18", "2026-11-17", "2027-01-02", "2027-01-30")]
    [InlineData("2026-11-01", "2026-11-15", "2026-11-17", "2027-01-02", "2027-01-30")]
    [InlineData("2026-12-25", "2027-01-08", "2027-01-08", "2027-01-08", "2027-01-30")]
    [InlineData("2027-01-10", "2027-01-15", "2027-01-15", "2027-01-15", "2027-01-30")]
    public void Should_GiveEveryStepTimeSinceItsCreation_When_TheEventWasCreatedLate(
        string createdOn,
        string detailsDue,
        string ticketsDue,
        string runningOrderDue,
        string reviewDue
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
                DateOnly.Parse(reviewDue),
            ],
            readiness.Steps.Select(status => status.DueOn)
        );
    }

    [Fact]
    public void Should_OpenTheRunningOrderAndTheReviewLater_When_TheStepsAreListed()
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
                new EventStepStatus(
                    EventStep.Review,
                    Waiting,
                    new DateOnly(2027, 1, 30),
                    new DateOnly(2027, 1, 17)
                ),
            ],
            readiness.Steps
        );
    }

    [Theory]
    [InlineData("2026-10-01", false, false, false, Open, Open, Waiting, Waiting, EventStep.Details)]
    [InlineData("2026-10-18", false, false, false, Open, Open, Waiting, Waiting, EventStep.Details)]
    [InlineData(
        "2026-10-19",
        false,
        false,
        false,
        Overdue,
        Open,
        Waiting,
        Waiting,
        EventStep.Details
    )]
    [InlineData(
        "2026-11-20",
        false,
        false,
        false,
        Overdue,
        Overdue,
        Waiting,
        Waiting,
        EventStep.Details
    )]
    [InlineData(
        "2026-11-20",
        true,
        false,
        false,
        Done,
        Overdue,
        Waiting,
        Waiting,
        EventStep.Tickets
    )]
    [InlineData("2026-10-01", true, false, false, Done, Open, Waiting, Waiting, EventStep.Tickets)]
    [InlineData("2026-10-01", true, true, false, Done, Done, Waiting, Waiting, null)]
    [InlineData("2026-12-18", true, true, false, Done, Done, Waiting, Waiting, null)]
    [InlineData("2026-12-19", true, true, false, Done, Done, Open, Waiting, EventStep.RunningOrder)]
    [InlineData("2027-01-02", true, true, false, Done, Done, Open, Waiting, EventStep.RunningOrder)]
    [InlineData(
        "2027-01-03",
        true,
        true,
        false,
        Done,
        Done,
        Overdue,
        Waiting,
        EventStep.RunningOrder
    )]
    [InlineData(
        "2027-01-03",
        false,
        true,
        false,
        Overdue,
        Done,
        Overdue,
        Waiting,
        EventStep.Details
    )]
    [InlineData("2026-12-01", true, true, true, Done, Done, Done, Waiting, null)]
    [InlineData("2027-01-03", true, true, true, Done, Done, Done, Waiting, null)]
    [InlineData("2027-01-17", false, false, false, Open, Open, Open, Open, EventStep.Review)]
    [InlineData("2027-02-01", false, false, false, Open, Open, Open, Overdue, EventStep.Review)]
    public void Should_PickOneCurrentStep_When_TheStepsStandAsGiven(
        string today,
        bool detailsDone,
        bool ticketsSet,
        bool runningOrderDone,
        EventStepState details,
        EventStepState tickets,
        EventStepState runningOrder,
        EventStepState review,
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
            [details, tickets, runningOrder, review],
            readiness.Steps.Select(status => status.State)
        );
        Assert.Equal(current, readiness.CurrentStep);
    }

    [Fact]
    public void Should_FinishTheReview_When_AnAlbumOfTheEventIsPublished()
    {
        var readiness = EventSteps.ReadinessOf(
            NothingDone with
            {
                AreDetailsDone = true,
                AreTicketsSet = true,
                IsRunningOrderDone = true,
                IsOver = true,
                HasPublishedAlbum = true,
            },
            Noon("2027-01-20")
        );

        Assert.All(readiness.Steps, status => Assert.Equal(Done, status.State));
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

    private static DateTimeOffset Noon(string day) =>
        new(DateOnly.Parse(day).ToDateTime(new TimeOnly(12, 0)), TimeSpan.Zero);
}
