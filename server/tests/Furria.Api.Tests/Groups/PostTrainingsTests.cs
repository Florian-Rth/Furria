using System.Net;
using System.Net.Http.Json;
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
public sealed class PostTrainingsTests
{
    private const string ValidationField = "request";
    private const int UnknownSlotId = 999_999;
    private const int TrainingMinutes = 90;
    private const int DaysPerWeek = 7;
    private const string TrainingTitle = "Training";
    private const string Abendprobe = "Abendprobe der Prinzengarde";
    private const string Sporthalle = "Sporthalle";
    private const string AltesLager = "Altes Lager";

    private static readonly DateOnly ArchivedIn2026 = new(2026, 6, 30);
    private static readonly TimeOnly HalfPastSeven = new(19, 30);
    private static readonly TimeOnly HalfPastFive = new(17, 30);
    private static readonly DateTimeOffset JustAfterTheSessionClosed = new(
        2027,
        2,
        12,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PostTrainingsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteEveryTickedEvening_When_TheGruppenAdminConfirms()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildRhythmAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");
        var slot = ctx.Club.TrainingSlots.IdOf("dienstags");
        var firstEvening = FirstTraining();

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainings,
            PostTrainingsRequest,
            PostTrainingsResponse
        >(
            new()
            {
                GroupId = tanzgarde,
                Title = TrainingTitle,
                Instants =
                [
                    new() { GroupTrainingSlotId = slot, StartsAt = firstEvening },
                    new()
                    {
                        GroupTrainingSlotId = slot,
                        StartsAt = firstEvening.AddDays(DaysPerWeek),
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, result.CreatedCount);
        Assert.Equal(0, result.SkippedCount);
        Assert.Empty(result.VenueCollisions);
        await ctx
            .Expected.TrainingsOf(tanzgarde)
            .ToHaveCount(2)
            .TrainingsOf(tanzgarde)
            .ToCarryTraining(
                TrainingTitle,
                firstEvening,
                firstEvening.AddMinutes(TrainingMinutes),
                ctx.Club.Venues.IdOf("sporthalle")
            )
            .TrainingsOf(tanzgarde)
            .ToCarryTraining(
                TrainingTitle,
                firstEvening.AddDays(DaysPerWeek),
                firstEvening.AddDays(DaysPerWeek).AddMinutes(TrainingMinutes),
                ctx.Club.Venues.IdOf("sporthalle")
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WriteNothingTwice_When_TheGruppenAdminRunsItAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildRhythmAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");
        var request = OneEvening(tanzgarde, ctx.Club.TrainingSlots.IdOf("dienstags"));

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        await client.POSTAsync<PostTrainings, PostTrainingsRequest, PostTrainingsResponse>(request);
        var (response, result) = await client.POSTAsync<
            PostTrainings,
            PostTrainingsRequest,
            PostTrainingsResponse
        >(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(0, result.CreatedCount);
        Assert.Equal(1, result.SkippedCount);
        await ctx.Expected.TrainingsOf(tanzgarde).ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WarnAboutTheOrtAndStillWrite_When_AnotherEintragHoldsIt()
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
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainings,
            PostTrainingsRequest,
            PostTrainingsResponse
        >(OneEvening(tanzgarde, ctx.Club.TrainingSlots.IdOf("dienstags")));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(1, result.CreatedCount);
        var collision = Assert.Single(result.VenueCollisions);
        Assert.Equal(Abendprobe, collision.Title);
        await ctx.Expected.TrainingsOf(tanzgarde).ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheEvening_When_ItDoesNotMatchTheTrainingszeit()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildRhythmAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostTrainings,
            PostTrainingsRequest,
            PostTrainingsResponse
        >(
            new()
            {
                GroupId = tanzgarde,
                Title = TrainingTitle,
                Instants =
                [
                    new()
                    {
                        GroupTrainingSlotId = ctx.Club.TrainingSlots.IdOf("dienstags"),
                        StartsAt = FirstTraining().AddHours(1),
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.TrainingsOf(tanzgarde).ToBeEmpty().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheTrainingszeit_When_ItBelongsToAnotherGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildRhythmAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostTrainings,
            PostTrainingsRequest,
            PostTrainingsResponse
        >(OneEvening(tanzgarde, UnknownSlotId));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.TrainingsOf(tanzgarde).ToBeEmpty().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheOrt_When_ErSeitDemRhythmusArchiviertWurde()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(
            club =>
                club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2026)
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
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostTrainings,
            PostTrainingsRequest,
            PostTrainingsResponse
        >(OneEvening(tanzgarde, ctx.Club.TrainingSlots.IdOf("dienstags")));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Ein archivierter Ort kann nicht mehr gewählt werden."],
            failures[ValidationField]
        );
        await ctx.Expected.TrainingsOf(tanzgarde).ToBeEmpty().AssertAsync(ct);
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
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostTrainings,
            PostTrainingsRequest,
            PostTrainingsResponse
        >(OneEvening(tanzgarde, ctx.Club.TrainingSlots.IdOf("dienstags")));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.TrainingsOf(tanzgarde).ToBeEmpty().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildRhythmAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<PostTrainings, PostTrainingsRequest, PostTrainingsResponse>(
                OneEvening(tanzgarde, ctx.Club.TrainingSlots.IdOf("dienstags"))
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx.Expected.TrainingsOf(tanzgarde).ToBeEmpty().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WriteTheLaufendenAbende_When_DieZeitMitArchiviertemOrtNichtAngehaktIst()
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
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostTrainings,
            PostTrainingsRequest,
            PostTrainingsResponse
        >(OneEvening(tanzgarde, ctx.Club.TrainingSlots.IdOf("dienstags")));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(1, result.CreatedCount);
        await ctx.Expected.TrainingsOf(tanzgarde).ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WriteTheWholeSession_When_DieGruppeJedenTagUndDienstagsZweimalProbt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(EveryDay, ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        await _fixture.AtInstantAsync(
            JustAfterTheSessionClosed,
            async () =>
            {
                var client = await ctx.Identity.ClientForAsync("anna", ct);
                var (previewResponse, preview) = await client.POSTAsync<
                    PostTrainingPreview,
                    PostTrainingPreviewRequest,
                    PostTrainingPreviewResponse
                >(new() { GroupId = tanzgarde, EndsOn = null });

                Assert.Equal(HttpStatusCode.OK, previewResponse.StatusCode);
                Assert.True(preview.Rows.Count > TrainingGenerator.MaxHorizonDays);

                var (response, result) = await client.POSTAsync<
                    PostTrainings,
                    PostTrainingsRequest,
                    PostTrainingsResponse
                >(
                    new()
                    {
                        GroupId = tanzgarde,
                        Title = TrainingTitle,
                        Instants =
                        [
                            .. preview.Rows.Select(row => new TrainingInstantDataDto
                            {
                                GroupTrainingSlotId = row.GroupTrainingSlotId,
                                StartsAt = row.StartsAt,
                            }),
                        ],
                    }
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(preview.Rows.Count, result.CreatedCount);
            }
        );
    }

    private PostTrainingsRequest OneEvening(int groupId, int groupTrainingSlotId) =>
        new()
        {
            GroupId = groupId,
            Title = TrainingTitle,
            Instants =
            [
                new() { GroupTrainingSlotId = groupTrainingSlotId, StartsAt = FirstTraining() },
            ],
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

    private static void EveryDay(ClubSeedBuilder club)
    {
        foreach (var weekday in Enum.GetValues<DayOfWeek>())
        {
            club.AddTrainingSlot(
                $"slot-{weekday}",
                "tanzgarde",
                weekday,
                HalfPastSeven,
                TrainingMinutes
            );
        }

        club.AddTrainingSlot(
            "dienstags-frueh",
            "tanzgarde",
            DayOfWeek.Tuesday,
            HalfPastFive,
            TrainingMinutes
        );
    }

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

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
