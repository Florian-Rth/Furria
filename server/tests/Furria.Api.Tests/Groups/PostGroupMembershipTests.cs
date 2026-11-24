using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class PostGroupMembershipTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";

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
    public async Task Should_LiftHerArchive_When_AnArchivedPersonJoinsTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddArchive("paula", ArchivedIn2021)
                    )
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
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
