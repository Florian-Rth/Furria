using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class CalendarPushRulesTests
{
    private const int Garde = 7;
    private const int CastGuest = 42;

    private static readonly DateTimeOffset Now = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);

    public static readonly TheoryData<int, TimeSpan> TimesToLive = new()
    {
        { 0, TimeSpan.FromHours(1) },
        { 30, TimeSpan.FromHours(1) },
        { 180, TimeSpan.FromHours(3) },
        { 60 * 24 * 60, TimeSpan.FromDays(28) },
    };

    [Theory]
    [MemberData(nameof(TimesToLive))]
    public void Should_LiveUntilTheEntryStartsWithinOneHourAndFourWeeks_When_APushIsSent(
        int minutesUntilStart,
        TimeSpan expected
    )
    {
        Assert.Equal(
            expected,
            CalendarPushRules.TimeToLive(Now.AddMinutes(minutesUntilStart), Now)
        );
    }

    [Theory]
    [InlineData(CalendarPushReason.AsksForResponse, -1, null, false)]
    [InlineData(CalendarPushReason.AsksForResponse, 1, null, true)]
    [InlineData(CalendarPushReason.Chosen, -1, 1, true)]
    [InlineData(CalendarPushReason.Moved, -2, null, true)]
    [InlineData(CalendarPushReason.Deleted, -4, null, false)]
    [InlineData(CalendarPushReason.Deleted, -4, -1, false)]
    public void Should_PushOnlyWhileTheEntryCanStillMatter_When_ThePushIsDispatched(
        CalendarPushReason reason,
        int startsInHours,
        int? endsInHours,
        bool isDue
    )
    {
        Assert.Equal(
            isDue,
            CalendarPushRules.IsDue(
                reason,
                Now.AddHours(startsInHours),
                endsInHours is { } hours ? Now.AddHours(hours) : null,
                Now
            )
        );
    }

    [Theory]
    [InlineData(CalendarEntryAudience.People, CalendarEntryAudience.People, new[] { 3 })]
    [InlineData(CalendarEntryAudience.Club, CalendarEntryAudience.People, new[] { 1, 3 })]
    [InlineData(CalendarEntryAudience.People, CalendarEntryAudience.Groups, new int[0])]
    public void Should_NameOnlyPeopleChosenByThisChange_When_AnEntryIsUpdated(
        CalendarEntryAudience before,
        CalendarEntryAudience after,
        int[] newlyChosen
    )
    {
        Assert.Equal(newlyChosen, CalendarPushRules.NewlyChosen(before, [1, 2], after, [1, 3]));
    }

    [Theory]
    [InlineData(CalendarPushReason.Announced, false)]
    [InlineData(CalendarPushReason.AsksForResponse, false)]
    [InlineData(CalendarPushReason.Reminder, true)]
    public void Should_ReachACastGuestOnlyWithAReminder_When_HerGroupsTrainingAsksForAResponse(
        CalendarPushReason reason,
        bool reaches
    )
    {
        var training = GardeTraining();

        Assert.Equal(
            reaches,
            CalendarPushRules.MayConcern(reason, training, CastGuestOf(training))
        );
    }

    private static CalendarEntryFacts GardeTraining() =>
        new()
        {
            OwnerGroupId = Garde,
            ParticipatingGroupIds = [],
            Audience = CalendarEntryAudience.Groups,
            AudienceGroupIds = [Garde],
            AudiencePersonIds = [],
            Kind = CalendarEntryKind.Training,
            AsksForResponse = true,
            StartsAt = Now.AddDays(3),
        };

    private static CalendarTies CastGuestOf(CalendarEntryFacts training) =>
        new()
        {
            PersonId = CastGuest,
            HoldsRunningMembership = false,
            Pauses = [],
            MemberGroupIds = new HashSet<int>(),
            AdminFunctions = new Dictionary<int, string?>(),
            CastSessions = new HashSet<GroupSession>
            {
                new(Garde, CastAttendance.SessionYearOf(training.StartsAt)),
            },
        };
}
