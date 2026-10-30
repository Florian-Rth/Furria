using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class CalendarTiesTests
{
    private const int SessionYear = 2026;
    private const int DanceGuard = 11;
    private const int ChildrensGuard = 22;
    private const int MensBallet = 33;
    private const string Coach = "Trainerin";

    private static readonly CalendarTies RunningMember = TiesOf(holdsRunningMembership: true);

    [Fact]
    public void Should_Concern_When_AClubOwnedEntryMeetsARunningMembership()
    {
        Assert.True(RunningMember.Concerns(ClubOwned()));
    }

    [Fact]
    public void Should_NotConcern_When_TheMembershipIsPausedForTheEntrysSession()
    {
        var paused = RunningMember with
        {
            Pauses = [new SessionSpan { FirstYear = SessionYear, LastYear = SessionYear }],
        };

        Assert.False(paused.Concerns(ClubOwned()));
    }

    [Fact]
    public void Should_Concern_When_SheIsInAParticipatingGroupOfAGroupOwnedEntry()
    {
        var ties = TiesOf(memberGroupIds: [DanceGuard]);

        Assert.True(ties.Concerns(GroupOwned(ChildrensGuard, DanceGuard)));
    }

    [Fact]
    public void Should_NotConcern_When_SheOnlyAdministersTheOwnerGroup()
    {
        var ties = TiesOf(adminGroupIds: [ChildrensGuard]);

        Assert.False(ties.Concerns(GroupOwned(ChildrensGuard)));
    }

    [Fact]
    public void Should_NotConcern_When_HerMemberGroupOnlyParticipatesInAClubOwnedEntry()
    {
        var ties = TiesOf(memberGroupIds: [MensBallet]);

        Assert.False(ties.Concerns(ClubOwned(MensBallet)));
    }

    [Fact]
    public void Should_FindTheRunGroup_When_SheAdministersAParticipatingGroup()
    {
        var ties = TiesOf(adminGroupIds: [ChildrensGuard]);

        Assert.Equal(ChildrensGuard, ties.RunsVia(ClubOwned(DanceGuard, ChildrensGuard)));
    }

    [Fact]
    public void Should_BeHers_When_HerMemberGroupParticipatesInAClubOwnedEntry()
    {
        var ties = TiesOf(memberGroupIds: [MensBallet]);

        Assert.True(ties.IsHers(ClubOwned(MensBallet)));
    }

    [Fact]
    public void Should_See_When_SheIsInAParticipatingGroupOfAGroupOnlyEntry()
    {
        var ties = TiesOf(memberGroupIds: [DanceGuard]);

        Assert.True(ties.Sees(GroupOnly(ChildrensGuard, DanceGuard), holdsClubRead: false));
    }

    [Fact]
    public void Should_NotSee_When_AGroupOnlyEntryBelongsToGroupsNotHers()
    {
        var ties = TiesOf(holdsRunningMembership: true, memberGroupIds: [MensBallet]);

        Assert.False(ties.Sees(GroupOnly(ChildrensGuard, DanceGuard), holdsClubRead: true));
    }

    [Fact]
    public void Should_See_When_SheHoldsClubReadAndTheEntryIsClubVisible()
    {
        Assert.True(RunningMember.Sees(GroupOwned(DanceGuard), holdsClubRead: true));
    }

    [Fact]
    public void Should_NotSee_When_SheHasNeitherClubReadNorATie()
    {
        var ties = TiesOf(memberGroupIds: [MensBallet]);

        Assert.False(ties.Sees(ClubOwned(), holdsClubRead: false));
    }

    [Fact]
    public void Should_ConcernAndShowTheTraining_When_SheIsInTheCastOfAnActOfTheTrainingsGroup()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear)]);
        var training = TrainingOf(GroupOnly(DanceGuard));

        Assert.Equal(
            (true, true),
            (guest.Concerns(training), guest.Sees(training, holdsClubRead: false))
        );
    }

    [Fact]
    public void Should_ConcernTheCast_When_TheActsGroupOnlyParticipatesInTheRehearsal()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear)]);
        var rehearsal = GroupOwned(MensBallet, DanceGuard) with
        {
            Kind = CalendarEntryKind.Rehearsal,
        };

        Assert.True(guest.Concerns(rehearsal));
    }

    [Fact]
    public void Should_NotConcernTheCast_When_TheEntryIsNoTrainingOrRehearsal()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear)]);

        Assert.False(guest.Concerns(GroupOwned(DanceGuard)));
    }

    [Fact]
    public void Should_NotConcernTheCast_When_TheActBelongsToAnotherSession()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear + 1)]);

        Assert.False(guest.Concerns(TrainingOf(GroupOwned(DanceGuard))));
    }

    private static CalendarEntryFacts TrainingOf(CalendarEntryFacts entry) =>
        entry with
        {
            Kind = CalendarEntryKind.Training,
        };

    private static CalendarTies TiesOf(
        bool holdsRunningMembership = false,
        int[]? memberGroupIds = null,
        int[]? adminGroupIds = null,
        GroupSession[]? castSessions = null
    ) =>
        new()
        {
            HoldsRunningMembership = holdsRunningMembership,
            Pauses = [],
            MemberGroupIds = (memberGroupIds ?? []).ToHashSet(),
            AdminFunctions = (adminGroupIds ?? []).ToDictionary(
                groupId => groupId,
                _ => (string?)Coach
            ),
            CastSessions = (castSessions ?? []).ToHashSet(),
        };

    private static CalendarEntryFacts ClubOwned(params int[] participatingGroupIds) =>
        new()
        {
            OwnerGroupId = null,
            ParticipatingGroupIds = participatingGroupIds,
            Visibility = CalendarEntryVisibility.Club,
            SessionYear = SessionYear,
            Kind = CalendarEntryKind.Meeting,
            CastSessionYear = SessionYear,
        };

    private static CalendarEntryFacts GroupOwned(
        int ownerGroupId,
        params int[] participatingGroupIds
    ) =>
        new()
        {
            OwnerGroupId = ownerGroupId,
            ParticipatingGroupIds = participatingGroupIds,
            Visibility = CalendarEntryVisibility.Club,
            SessionYear = SessionYear,
            Kind = CalendarEntryKind.Meeting,
            CastSessionYear = SessionYear,
        };

    private static CalendarEntryFacts GroupOnly(
        int ownerGroupId,
        params int[] participatingGroupIds
    ) =>
        GroupOwned(ownerGroupId, participatingGroupIds) with
        {
            Visibility = CalendarEntryVisibility.Group,
        };
}
