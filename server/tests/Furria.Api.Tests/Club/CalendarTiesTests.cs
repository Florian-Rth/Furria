using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class CalendarTiesTests
{
    private const int SessionYear = 2026;
    private const int DanceGuard = 11;
    private const int ChildrensGuard = 22;
    private const int MensBallet = 33;
    private const int Chosen = 501;
    private const int Bystander = 502;
    private const string Coach = "Trainerin";

    private static readonly DateTimeOffset InSession = new(
        2026,
        12,
        5,
        19,
        0,
        0,
        TimeSpan.FromHours(1)
    );
    private static readonly CalendarRights ClubReader = new(true, false);
    private static readonly CalendarRights NoClubRead = new(false, false);
    private static readonly CalendarRights ClubCalendarManager = new(true, true);
    private static readonly CalendarTies RunningMember = TiesOf(holdsRunningMembership: true);

    [Fact]
    public void Should_Concern_When_AClubEntryMeetsARunningMembership()
    {
        Assert.True(RunningMember.Concerns(ForClub()));
    }

    [Fact]
    public void Should_ConcernEveryRunningMember_When_AGroupOwnsAClubEntry()
    {
        Assert.True(RunningMember.Concerns(ForClub(owner: DanceGuard)));
    }

    [Fact]
    public void Should_NotConcern_When_TheMembershipIsPausedForTheEntrysSession()
    {
        var paused = RunningMember with
        {
            Pauses = [new SessionSpan { FirstYear = SessionYear, LastYear = SessionYear }],
        };

        Assert.False(paused.Concerns(ForClub()));
    }

    [Fact]
    public void Should_Concern_When_SheIsInAnAudienceGroup()
    {
        var ties = TiesOf(memberGroupIds: [DanceGuard]);

        Assert.True(ties.Concerns(ForGroups([ChildrensGuard, DanceGuard])));
    }

    [Fact]
    public void Should_NotConcernTheRestOfTheClub_When_TheAudienceIsGroups()
    {
        Assert.False(RunningMember.Concerns(ForGroups([DanceGuard])));
    }

    [Fact]
    public void Should_NotConcern_When_HerGroupOnlyParticipates()
    {
        var ties = TiesOf(memberGroupIds: [MensBallet]);

        Assert.False(ties.Concerns(ForGroups([DanceGuard], participating: [MensBallet])));
    }

    [Fact]
    public void Should_NotConcern_When_SheOnlyAdministersTheAudienceGroup()
    {
        var ties = TiesOf(adminGroupIds: [ChildrensGuard]);

        Assert.False(ties.Concerns(ForGroups([ChildrensGuard], owner: ChildrensGuard)));
    }

    [Fact]
    public void Should_ConcernOnlyTheChosen_When_TheAudienceIsChosenPeople()
    {
        var entry = ForPeople([Chosen]);

        Assert.Equal(
            (true, false),
            (TiesOf(personId: Chosen).Concerns(entry), RunningMember.Concerns(entry))
        );
    }

    [Fact]
    public void Should_FindTheRunGroup_When_SheAdministersAParticipatingGroup()
    {
        var ties = TiesOf(adminGroupIds: [ChildrensGuard]);

        Assert.Equal(
            ChildrensGuard,
            ties.RunsVia(ForClub(participating: [DanceGuard, ChildrensGuard]))
        );
    }

    [Fact]
    public void Should_BeHers_When_HerMemberGroupParticipatesInAClubOwnedEntry()
    {
        var ties = TiesOf(memberGroupIds: [MensBallet]);

        Assert.True(ties.IsHers(ForClub(participating: [MensBallet])));
    }

    [Fact]
    public void Should_NotBeHers_When_HerGroupParticipatesInAChosenPeopleEntry()
    {
        var ties = TiesOf(memberGroupIds: [MensBallet], adminGroupIds: [MensBallet]);

        Assert.False(ties.IsHers(ForPeople([Chosen], participating: [MensBallet])));
    }

    [Fact]
    public void Should_SeeAGroupsEntry_When_SheHoldsClubReadWithoutATie()
    {
        Assert.True(RunningMember.Sees(ForGroups([DanceGuard], owner: DanceGuard), ClubReader));
    }

    [Fact]
    public void Should_See_When_SheIsInAnAudienceGroupWithoutClubRead()
    {
        var ties = TiesOf(memberGroupIds: [DanceGuard]);

        Assert.True(ties.Sees(ForGroups([DanceGuard]), NoClubRead));
    }

    [Fact]
    public void Should_NotSee_When_SheHasNeitherClubReadNorATie()
    {
        var ties = TiesOf(memberGroupIds: [MensBallet]);

        Assert.False(ties.Sees(ForClub(), NoClubRead));
    }

    [Fact]
    public void Should_NotSeeAChosenPeopleEntry_When_SheHoldsClubReadButIsNotChosen()
    {
        var ties = TiesOf(personId: Bystander, holdsRunningMembership: true);

        Assert.False(ties.Sees(ForPeople([Chosen]), ClubReader));
    }

    [Fact]
    public void Should_SeeAChosenPeopleEntry_When_SheIsChosenWithoutClubRead()
    {
        Assert.True(TiesOf(personId: Chosen).Sees(ForPeople([Chosen]), NoClubRead));
    }

    [Fact]
    public void Should_SeeAChosenPeopleEntry_When_SheAdministersTheOwnerGroup()
    {
        var ties = TiesOf(personId: Bystander, adminGroupIds: [DanceGuard]);

        Assert.True(ties.Sees(ForPeople([Chosen], owner: DanceGuard), NoClubRead));
    }

    [Fact]
    public void Should_SeeAClubOwnedChosenPeopleEntry_When_SheManagesTheClubCalendar()
    {
        var ties = TiesOf(personId: Bystander);

        Assert.True(ties.Sees(ForPeople([Chosen]), ClubCalendarManager));
    }

    [Fact]
    public void Should_ConcernAndShowTheTraining_When_SheIsInTheCastOfAnActOfTheAudienceGroup()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear)]);
        var training = TrainingOf(ForGroups([DanceGuard]));

        Assert.Equal((true, true), (guest.Concerns(training), guest.Sees(training, NoClubRead)));
    }

    [Fact]
    public void Should_ConcernTheCast_When_TheActsGroupOwnsAClubTraining()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear)]);

        Assert.True(guest.Concerns(TrainingOf(ForClub(owner: DanceGuard))));
    }

    [Fact]
    public void Should_NotConcernTheCast_When_TheActsGroupOnlyParticipatesInTheTraining()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear)]);

        Assert.False(
            guest.Concerns(TrainingOf(ForGroups([MensBallet], participating: [DanceGuard])))
        );
    }

    [Fact]
    public void Should_NotConcernTheCast_When_TheTrainingIsForChosenPeople()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear)]);

        Assert.False(guest.Concerns(TrainingOf(ForPeople([Chosen], owner: DanceGuard))));
    }

    [Fact]
    public void Should_NotConcernTheCast_When_TheTrainingDoesNotAskForResponses()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear)]);
        var silentTraining = TrainingOf(ForGroups([DanceGuard])) with { AsksForResponse = false };

        Assert.False(guest.Concerns(silentTraining));
    }

    [Fact]
    public void Should_NotConcernTheCast_When_AnEntryAskingForResponsesIsNoTraining()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear)]);
        var trip = ForGroups([DanceGuard]) with
        {
            Kind = CalendarEntryKind.Trip,
            AsksForResponse = true,
        };

        Assert.False(guest.Concerns(trip));
    }

    [Fact]
    public void Should_NotConcernTheCast_When_TheActBelongsToAnotherSession()
    {
        var guest = TiesOf(castSessions: [new GroupSession(DanceGuard, SessionYear + 1)]);

        Assert.False(guest.Concerns(TrainingOf(ForGroups([DanceGuard]))));
    }

    private static CalendarEntryFacts TrainingOf(CalendarEntryFacts entry) =>
        entry with
        {
            Kind = CalendarEntryKind.Training,
            AsksForResponse = true,
        };

    private static CalendarTies TiesOf(
        int? personId = null,
        bool holdsRunningMembership = false,
        int[]? memberGroupIds = null,
        int[]? adminGroupIds = null,
        GroupSession[]? castSessions = null
    ) =>
        new()
        {
            PersonId = personId,
            HoldsRunningMembership = holdsRunningMembership,
            Pauses = [],
            MemberGroupIds = (memberGroupIds ?? []).ToHashSet(),
            AdminFunctions = (adminGroupIds ?? []).ToDictionary(
                groupId => groupId,
                _ => (string?)Coach
            ),
            CastSessions = (castSessions ?? []).ToHashSet(),
        };

    private static CalendarEntryFacts ForClub(int? owner = null, int[]? participating = null) =>
        Entry(CalendarEntryAudience.Club, owner, participating);

    private static CalendarEntryFacts ForGroups(
        int[] audienceGroupIds,
        int? owner = null,
        int[]? participating = null
    ) =>
        Entry(CalendarEntryAudience.Groups, owner, participating) with
        {
            AudienceGroupIds = audienceGroupIds,
        };

    private static CalendarEntryFacts ForPeople(
        int[] audiencePersonIds,
        int? owner = null,
        int[]? participating = null
    ) =>
        Entry(CalendarEntryAudience.People, owner, participating) with
        {
            AudiencePersonIds = audiencePersonIds,
        };

    private static CalendarEntryFacts Entry(
        CalendarEntryAudience audience,
        int? owner,
        int[]? participating
    ) =>
        new()
        {
            OwnerGroupId = owner,
            ParticipatingGroupIds = participating ?? [],
            Audience = audience,
            AudienceGroupIds = [],
            AudiencePersonIds = [],
            Kind = CalendarEntryKind.Plain,
            AsksForResponse = false,
            StartsAt = InSession,
        };
}
