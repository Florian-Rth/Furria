using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class PostMembershipPauseTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int PausedFrom2018 = 2018;
    private const int PausedUntil2019 = 2019;
    private const int BeforeTheMembership = 2015;
    private const int BeforeTheFounding = 1970;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);

    private readonly ApiTestFixture _fixture;

    public PostMembershipPauseTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenTheMembershipPause_When_AManagerPausesARunningMembership()
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostMembershipPause,
            PostMembershipPauseRequest,
            PostMembershipPauseResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                FirstSessionYear = _fixture.CurrentSessionYear,
                LastSessionYear = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.MembershipPause(result.PauseId)
            .ToHaveSpan(_fixture.CurrentSessionYear, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheLastSessionPrecedesTheFirst()
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
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
                LastSessionYear = PausedFrom2018,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine Ruhezeit kann nicht vor ihrer ersten Session enden."],
            failures[ValidationField]
        );
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
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

    [Fact]
    public async Task Should_AddTheMembershipPause_When_TheMembershipIsAlreadyClosed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedMembershipAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
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

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.MembershipPause(result.PauseId)
            .ToHaveSpan(PausedFrom2018, PausedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheMembershipBelongsToAnotherPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("mara", "Mara", "Lenz")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembershipPause,
            PostMembershipPauseRequest,
            PostMembershipPauseResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("mara"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                FirstSessionYear = PausedFrom2018,
                LastSessionYear = PausedUntil2019,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheFirstSessionPredatesTheFounding()
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembershipPause,
            PostMembershipPauseRequest,
            PostMembershipPauseResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                MembershipId = ctx.Identity.Memberships.IdOf("paula-erste"),
                FirstSessionYear = BeforeTheFounding,
                LastSessionYear = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                            .AddMembership("paula-erste", "paula", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
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

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
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

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<
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

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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
