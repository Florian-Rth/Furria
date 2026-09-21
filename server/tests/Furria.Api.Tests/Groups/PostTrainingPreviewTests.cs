using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class PostTrainingPreviewTests
{
    private const int UnknownGroupId = 999_999;
    private const int TrainingMinutes = 90;
    private const int DaysPerWeek = 7;
    private const int TwoWeeks = 14;
    private const string Abendprobe = "Abendprobe der Prinzengarde";
    private const string Krisensitzung = "Krisensitzung der Kindergarde";
    private const string GardeTraining = "Training der Tanzgarde";
    private const string Sporthalle = "Sporthalle";
    private const string AltesLager = "Altes Lager";

    private static readonly DateOnly ArchivedIn2026 = new(2026, 6, 30);
    private static readonly TimeOnly HalfPastSeven = new(19, 30);

    private readonly ApiTestFixture _fixture;

    public PostTrainingPreviewTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListEveryEvening_When_TheGruppeStatesOneSlot()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildRhythmAsync(ct);
        var firstEvening = FirstTraining();

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(TwoWeeksOf(ctx));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(3, result.Rows.Count);
        Assert.All(result.Rows, row => Assert.Equal(TrainingPreviewState.Creatable, row.State));
        Assert.Equal(
            [firstEvening, firstEvening.AddDays(DaysPerWeek), firstEvening.AddDays(TwoWeeks)],
            result.Rows.Select(row => row.StartsAt)
        );
        var first = result.Rows[0];
        Assert.Equal(Sporthalle, first.VenueName);
        Assert.Equal(firstEvening.AddMinutes(TrainingMinutes), first.EndsAt);
    }

    [Fact]
    public async Task Should_EndAtTheSessionClose_When_TheCallerNamesNoEndDate()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildRhythmAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(WholeSessionOf(ctx));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(result.DefaultEndsOn, result.EndsOn);
        Assert.True(result.DefaultEndsOn > _fixture.Today);
        Assert.NotEmpty(result.Rows);
    }

    [Fact]
    public async Task Should_WarnAboutTheOrt_When_AnotherEintragHoldsItThatEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var firstEvening = FirstTraining();
        var ctx = await BuildAsync(
            club =>
            {
                Rhythm(club);
                club.AddCalendarEntry(
                    "abendprobe",
                    Abendprobe,
                    firstEvening,
                    firstEvening.AddMinutes(TrainingMinutes),
                    venueAlias: "sporthalle"
                );
            },
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(TwoWeeksOf(ctx));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var first = result.Rows[0];
        Assert.Equal(TrainingPreviewState.VenueTaken, first.State);
        var collision = Assert.Single(first.VenueCollisions);
        Assert.Equal(Abendprobe, collision.Title);
        Assert.Equal(
            [TrainingPreviewState.Creatable, TrainingPreviewState.Creatable],
            result.Rows.Skip(1).Select(row => row.State)
        );
    }

    [Fact]
    public async Task Should_LeaveTheOrtFree_When_TheCallerMayNotReadTheEintragHoldingIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var firstEvening = FirstTraining();
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(Trainerin)
                    .Groups(groups =>
                    {
                        Tanzgarde(groups);
                        groups.AddGroup("kindergarde", "Kindergarde");
                    })
                    .Club(club =>
                    {
                        Rhythm(club);
                        club.AddCalendarEntry(
                            "krisensitzung",
                            Krisensitzung,
                            firstEvening,
                            firstEvening.AddMinutes(TrainingMinutes),
                            visibility: CalendarEntryVisibility.Group,
                            venueAlias: "sporthalle",
                            ownerGroupAlias: "kindergarde"
                        );
                    }),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(TwoWeeksOf(ctx));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.All(result.Rows, row => Assert.Equal(TrainingPreviewState.Creatable, row.State));
    }

    [Fact]
    public async Task Should_MarkTheEveningAsTaken_When_ATrainingOfThatGruppeAlreadyStands()
    {
        var ct = TestContext.Current.CancellationToken;
        var firstEvening = FirstTraining();
        var ctx = await BuildAsync(
            club =>
            {
                Rhythm(club);
                club.AddCalendarEntry(
                    "garde-training",
                    GardeTraining,
                    firstEvening,
                    firstEvening.AddMinutes(TrainingMinutes),
                    kind: CalendarEntryKind.Training,
                    visibility: CalendarEntryVisibility.Group,
                    ownerGroupAlias: "tanzgarde"
                );
            },
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(TwoWeeksOf(ctx));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(TrainingPreviewState.AlreadyExists, result.Rows[0].State);
        Assert.Equal(TrainingPreviewState.Creatable, result.Rows[1].State);
    }

    [Fact]
    public async Task Should_ListNothing_When_TheGruppeStatesNoRhythm()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(club => club.AddVenue("sporthalle", Sporthalle), ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(WholeSessionOf(ctx));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Rows);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyHoldsCalendarManageClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                    {
                        Trainerin(identity);
                        identity.AddPerson("ilka", "Ilka", "Kalender").AddAccount("ilka");
                    })
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "terminpflege",
                            "ilka-terminpflege",
                            "Terminpflege",
                            "ilka",
                            FurriaPermissions.CalendarManageClub
                        )
                    )
                    .Groups(Tanzgarde)
                    .Club(Rhythm),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(WholeSessionOf(ctx));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheGruppeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildRhythmAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(new() { GroupId = UnknownGroupId, EndsOn = null });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildRhythmAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<
                PostTrainingPreview,
                PostTrainingPreviewRequest,
                PostTrainingPreviewResponse
            >(WholeSessionOf(ctx));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_MarkEveryEvening_When_DerOrtDerTrainingszeitArchiviertWurde()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            club =>
                club.AddVenue("altes-lager", AltesLager, archivedOn: ArchivedIn2026)
                    .AddTrainingSlot(
                        "dienstags",
                        "tanzgarde",
                        DayOfWeek.Tuesday,
                        HalfPastSeven,
                        TrainingMinutes,
                        "altes-lager"
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(TwoWeeksOf(ctx));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(3, result.Rows.Count);
        Assert.All(result.Rows, row => Assert.Equal(TrainingPreviewState.VenueArchived, row.State));
        Assert.Equal(AltesLager, result.Rows[0].VenueName);
    }

    [Fact]
    public async Task Should_MarkOnlyTheAffectedEvenings_When_EineZweiteTrainingszeitLaeuft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            club =>
            {
                Rhythm(club);
                club.AddVenue("altes-lager", AltesLager, archivedOn: ArchivedIn2026)
                    .AddTrainingSlot(
                        "donnerstags",
                        "tanzgarde",
                        DayOfWeek.Thursday,
                        HalfPastSeven,
                        TrainingMinutes,
                        "altes-lager"
                    );
            },
            ct
        );
        var dienstags = ctx.Club.TrainingSlots.IdOf("dienstags");
        var donnerstags = ctx.Club.TrainingSlots.IdOf("donnerstags");

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(TwoWeeksOf(ctx));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.All(
            result.Rows.Where(row => row.GroupTrainingSlotId == dienstags),
            row => Assert.Equal(TrainingPreviewState.Creatable, row.State)
        );
        Assert.Contains(
            result.Rows,
            row =>
                row.GroupTrainingSlotId == donnerstags
                && row.State == TrainingPreviewState.VenueArchived
        );
        Assert.All(
            result.Rows.Where(row => row.GroupTrainingSlotId == donnerstags),
            row => Assert.Equal(TrainingPreviewState.VenueArchived, row.State)
        );
    }

    [Fact]
    public async Task Should_MarkTheEveningAsHeld_When_EsSchonExistiertUndDerOrtArchiviertIst()
    {
        var ct = TestContext.Current.CancellationToken;
        var firstEvening = FirstTraining();
        var ctx = await BuildAsync(
            club =>
                club.AddVenue("altes-lager", AltesLager, archivedOn: ArchivedIn2026)
                    .AddTrainingSlot(
                        "dienstags",
                        "tanzgarde",
                        DayOfWeek.Tuesday,
                        HalfPastSeven,
                        TrainingMinutes,
                        "altes-lager"
                    )
                    .AddCalendarEntry(
                        "training",
                        GardeTraining,
                        firstEvening,
                        firstEvening.AddMinutes(TrainingMinutes),
                        CalendarEntryKind.Training,
                        CalendarEntryVisibility.Group,
                        ownerGroupAlias: "tanzgarde"
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainingPreview,
            PostTrainingPreviewRequest,
            PostTrainingPreviewResponse
        >(TwoWeeksOf(ctx));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(TrainingPreviewState.AlreadyExists, result.Rows[0].State);
        Assert.Equal(TrainingPreviewState.VenueArchived, result.Rows[1].State);
    }

    private static PostTrainingPreviewRequest WholeSessionOf(SeededContext ctx) =>
        new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde"), EndsOn = null };

    private PostTrainingPreviewRequest TwoWeeksOf(SeededContext ctx) =>
        new()
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            EndsOn = FirstTrainingDay().AddDays(TwoWeeks),
        };

    private Task<SeededContext> BuildRhythmAsync(CancellationToken ct) => BuildAsync(Rhythm, ct);

    private Task<SeededContext> BuildAsync(Action<ClubSeedBuilder> club, CancellationToken ct) =>
        _fixture.BuildAsync(
            builder => builder.Identity(Trainerin).Groups(Tanzgarde).Club(club),
            ct
        );

    private DateOnly FirstTrainingDay()
    {
        var today = _fixture.Today;
        var ahead = ((int)DayOfWeek.Tuesday - (int)today.DayOfWeek + DaysPerWeek) % DaysPerWeek;

        return today.AddDays(ahead);
    }

    private DateTimeOffset FirstTraining() => ClubClock.At(FirstTrainingDay(), HalfPastSeven);

    private static void Trainerin(IdentitySeedBuilder identity) =>
        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna");

    private static void Tanzgarde(GroupSeedBuilder groups) =>
        groups
            .AddGroup("tanzgarde", "Tanzgarde")
            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna");

    private static void Rhythm(ClubSeedBuilder club) =>
        club.AddVenue("sporthalle", Sporthalle)
            .AddTrainingSlot(
                "dienstags",
                "tanzgarde",
                DayOfWeek.Tuesday,
                HalfPastSeven,
                TrainingMinutes,
                "sporthalle"
            );
}
