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
public sealed class PostMembershipTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int UnknownPersonId = 999_999;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2023 = new(2023, 9, 1);

    private readonly ApiTestFixture _fixture;

    public PostMembershipTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenTheMembership_When_AManagerTakesAPersonIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                StartedOn = JoinedIn2017,
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Membership(result.MembershipId)
            .ToHavePeriod(JoinedIn2017, null)
            .MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = UnknownPersonId,
                StartedOn = JoinedIn2017,
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.MembershipsOfPerson(UnknownPersonId).ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AMembershipIsAlreadyRunning()
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
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                StartedOn = RejoinedIn2023,
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Es läuft bereits eine Mitgliedschaft."], failures[ConflictField]);
        await ctx
            .Expected.MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheRejoinStartsOnTheDayTheLastOneEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedMembershipAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                StartedOn = LeftIn2020,
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            [
                "Dieser Zeitraum überschneidet sich mit einer bestehenden Mitgliedschaft. "
                    + "Ein Wiedereintritt beginnt frühestens am Tag nach dem Ende der vorigen Mitgliedschaft.",
            ],
            failures[ConflictField]
        );
        await ctx
            .Expected.MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_ThePeriodEndsBeforeItStarts()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedMembershipAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                StartedOn = new DateOnly(2019, 1, 1),
                EndedOn = new DateOnly(2018, 1, 1),
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine Mitgliedschaft kann nicht vor ihrem Beginn enden."],
            failures[ValidationField]
        );
        await ctx
            .Expected.MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenASecondMembership_When_TheRejoinStartsAfterTheLastOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedMembershipAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                StartedOn = LeftIn2020.AddDays(1),
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(ctx.Identity.Memberships.IdOf("paula-erste"), result.MembershipId);
        await ctx
            .Expected.Membership(result.MembershipId)
            .ToHavePeriod(LeftIn2020.AddDays(1), null)
            .MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveCount(2)
            .MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheWholePeriod_When_AHistoricMembershipIsRecorded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                StartedOn = JoinedIn2017,
                EndedOn = LeftIn2020,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Membership(result.MembershipId)
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveOpenCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheRow_When_TheMembershipStartsInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var joinsTomorrow = _fixture.Today.AddDays(1);
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                StartedOn = joinsTomorrow,
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Membership(result.MembershipId)
            .ToHavePeriod(joinsTomorrow, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = 0,
                StartedOn = JoinedIn2017,
                EndedOn = null,
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
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                StartedOn = JoinedIn2017,
                EndedOn = null,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<PostMembership, PostMembershipRequest, PostMembershipResponse>(
                new()
                {
                    PersonId = ctx.Identity.People.IdOf("paula"),
                    StartedOn = JoinedIn2017,
                    EndedOn = null,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordTheHistoricPeriod_When_ALaterMembershipIsAlreadyRunning()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-zweite", "paula", RejoinedIn2023)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostMembership,
            PostMembershipRequest,
            PostMembershipResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                StartedOn = JoinedIn2017,
                EndedOn = LeftIn2020,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Membership(result.MembershipId)
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveCount(2)
            .MembershipsOfPerson(ctx.Identity.People.IdOf("paula"))
            .ToHaveOpenCount(1)
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
