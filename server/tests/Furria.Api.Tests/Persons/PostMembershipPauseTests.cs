using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PostMembershipPauseTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const string ArchivedPersonMessage =
        "Paula ist archiviert – Ruhezeiten lassen sich erst nach dem Wiederherstellen festhalten.";
    private const int PausedFrom2018 = 2018;
    private const int PausedUntil2019 = 2019;
    private const int BeforeTheMembership = 2015;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);

    private readonly ApiTestFixture _fixture;

    public PostMembershipPauseTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RefuseAndKeepHerArchived_When_SheIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                        .AddArchive("paula", ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembershipPause,
            PostMembershipPauseRequest,
            PostMembershipPauseResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                FirstSessionYear = PausedFrom2018,
                LastSessionYear = PausedUntil2019,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedPersonMessage], failures[ConflictField]);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(ArchivedIn2021, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheMembershipPauseLiesOutsideTheMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembershipPause,
            PostMembershipPauseRequest,
            PostMembershipPauseResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                FirstSessionYear = BeforeTheMembership,
                LastSessionYear = BeforeTheMembership + 1,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Die Ruhezeit 2015/16 – 2016/17 liegt außerhalb der Mitgliedschaft."],
            failures[ValidationField]
        );
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_AnOpenMembershipPauseIsAddedToAnEndedMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedMembershipAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembershipPause,
            PostMembershipPauseRequest,
            PostMembershipPauseResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                FirstSessionYear = PausedFrom2018,
                LastSessionYear = null,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            [
                "Zu einer beendeten Mitgliedschaft gehört keine offene Ruhezeit. "
                    + "Gib die letzte Session an.",
            ],
            failures[ValidationField]
        );
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheMembershipPauseOverlapsAnother()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                        .AddMembershipPause(
                            "paula-ruhte",
                            "paula-erste",
                            PausedFrom2018,
                            PausedUntil2019
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembershipPause,
            PostMembershipPauseRequest,
            PostMembershipPauseResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                FirstSessionYear = PausedUntil2019,
                LastSessionYear = PausedUntil2019 + 1,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Dieser Zeitraum überschneidet sich mit einer bestehenden Ruhezeit."],
            failures[ConflictField]
        );
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-ruhte"))
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithEndedMembershipAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                ),
            ct
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
