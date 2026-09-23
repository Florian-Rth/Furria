using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class PostGroupMembershipTests
{
    private const string ConflictField = "conflict";
    private const int UnknownGroupId = 999_999;
    private const int UnknownPersonId = 999_998;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly RejoinedIn2023 = new(2023, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostGroupMembershipTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenTheGroupMembership_When_TheGroupAdminTakesAPersonIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna", "Trainerin")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = JoinedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.GroupMembership(result.GroupMembershipId)
            .ToHavePeriod(JoinedIn2017, null)
            .GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePersonAlreadyBelongsToTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = RejoinedIn2023,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Person gehört der Gruppe bereits an."], failures[ConflictField]);
        await ctx
            .Expected.GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheNewPeriodOverlapsAnEndedGroupMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedGroupMembershipAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = new DateOnly(2019, 1, 1),
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            [
                "Dieser Zeitraum überschneidet sich mit einer bestehenden Zugehörigkeit. "
                    + "Ein Wiedereintritt beginnt frühestens am Tag nach dem Ende der vorigen Zugehörigkeit.",
            ],
            failures[ConflictField]
        );
        await ctx
            .Expected.GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheRejoinStartsOnTheDayTheLastOneEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedGroupMembershipAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = LeftIn2020,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenASecondGroupMembership_When_TheRejoinStartsAfterTheLastOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEndedGroupMembershipAsync(ct);

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = LeftIn2020.AddDays(1),
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(
            ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            result.GroupMembershipId
        );
        await ctx
            .Expected.GroupMembership(result.GroupMembershipId)
            .ToHavePeriod(LeftIn2020.AddDays(1), null)
            .GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(2)
            .GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGroupIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "gruppenpflege-holding",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = UnknownGroupId,
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = JoinedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
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
        var (response, _) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = UnknownPersonId,
                JoinedOn = JoinedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(0)
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
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", archivedOn: ArchivedIn2021)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = JoinedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppe kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyBelongsToTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("mara")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = JoinedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AllowTheHigherInstance_When_TheCallerHoldsGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("ilka")
                    )
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "gruppenpflege-holding",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = JoinedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.GroupMembership(result.GroupMembershipId)
            .ToHavePeriod(JoinedIn2017, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheRow_When_TheGroupMembershipStartsInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var joinsTomorrow = _fixture.Today.AddDays(1);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                JoinedOn = joinsTomorrow,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.GroupMembership(result.GroupMembershipId)
            .ToHavePeriod(joinsTomorrow, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_ThePersonIdIsNotAnId()
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
        var (response, _) = await client.POSTAsync<
            PostGroupMembership,
            PostGroupMembershipRequest,
            PostGroupMembershipResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = 0,
                JoinedOn = JoinedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<
                PostGroupMembership,
                PostGroupMembershipRequest,
                PostGroupMembershipResponse
            >(
                new()
                {
                    GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                    PersonId = ctx.Identity.People.IdOf("paula"),
                    JoinedOn = JoinedIn2017,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithEndedGroupMembershipAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
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
