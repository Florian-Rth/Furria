using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class PutGroupUsualTrainingTimesTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const int TrainingMinutes = 90;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly TimeOnly HalfPastSeven = new(19, 30);
    private static readonly TimeOnly SixInTheEvening = new(18, 0);

    private readonly ApiTestFixture _fixture;

    public PutGroupUsualTrainingTimesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReplaceTheWholeList_When_TheGroupAdminSavesAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle")
                            .AddUsualTrainingTime(
                                "montags",
                                "tanzgarde",
                                DayOfWeek.Monday,
                                SixInTheEvening,
                                TrainingMinutes,
                                "sporthalle"
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<
            PutGroupUsualTrainingTimes,
            PutGroupUsualTrainingTimesRequest
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                UsualTrainingTimes =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.UsualTrainingTimesOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(1)
            .UsualTrainingTimesOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToCarryUsualTime(DayOfWeek.Tuesday, HalfPastSeven, TrainingMinutes, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheVenueIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .Club(club =>
                        club.AddVenue("alte-halle", "Alte Halle", archivedOn: ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<
            PutGroupUsualTrainingTimes,
            PutGroupUsualTrainingTimesRequest
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                UsualTrainingTimes =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = ctx.Club.Venues.IdOf("alte-halle"),
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Ein archivierter Ort kann nicht mehr gewählt werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.UsualTrainingTimesOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeEmpty()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", archivedOn: ArchivedIn2021)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<
            PutGroupUsualTrainingTimes,
            PutGroupUsualTrainingTimesRequest
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                UsualTrainingTimes =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = TrainingMinutes,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppe kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.UsualTrainingTimesOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeEmpty()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTrainingRunsLongerThanADay()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<
            PutGroupUsualTrainingTimes,
            PutGroupUsualTrainingTimesRequest
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                UsualTrainingTimes =
                [
                    new()
                    {
                        Weekday = DayOfWeek.Tuesday,
                        StartsAt = HalfPastSeven,
                        DurationMinutes = 1_441,
                        VenueId = null,
                    },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.UsualTrainingTimesOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeEmpty()
            .AssertAsync(ct);
    }

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
