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

    private static CalendarTies TiesOf(
        bool holdsRunningMembership = false,
        int[]? memberGroupIds = null,
        int[]? adminGroupIds = null
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
        };

    private static CalendarEntryFacts ClubOwned(params int[] participatingGroupIds) =>
        new()
        {
            OwnerGroupId = null,
            ParticipatingGroupIds = participatingGroupIds,
            Visibility = CalendarEntryVisibility.Club,
            SessionYear = SessionYear,
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
