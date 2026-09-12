using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetManagedGroupByIdTests
{
    private const int UnknownGroupId = 999_999;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly ArchivedIn2022 = new(2022, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetManagedGroupByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheRunningPeople_When_TheKeyHolderOpensTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                "Die Garde tanzt seit 1971.",
                                isRecruiting: true
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetManagedGroupById,
            GetManagedGroupByIdRequest,
            GetManagedGroupByIdResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), result.GroupId);
        Assert.Equal("Tanzgarde", result.Name);
        Assert.Equal("Die Garde tanzt seit 1971.", result.Description);
        Assert.True(result.IsRecruiting);
        Assert.Null(result.ArchivedOn);
        var paula = Assert.Single(result.Members);
        Assert.Equal(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"), paula.GroupMembershipId);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
        Assert.Equal(JoinedIn2017, paula.JoinedOn);
        Assert.Null(paula.LeftOn);
        Assert.Equal(JoinedIn2017, paula.Since);
        var anna = Assert.Single(result.Admins);
        Assert.Equal(ctx.Groups.GroupAdmins.IdOf("anna-tanzgarde"), anna.GroupAdminId);
        Assert.Equal("Trainerin", anna.Function);
        Assert.Equal(JoinedIn2017, anna.SinceOn);
        Assert.Null(anna.UntilOn);
        Assert.Equal(JoinedIn2017, anna.Since);
        Assert.Empty(result.PastMembers);
        Assert.Empty(result.PastAdmins);
    }

    [Fact]
    public async Task Should_CarryTheHistory_When_ZugehoerigkeitenAndErnennungenHaveEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("nadine", "Nadine", "Gerber")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupMembership(
                                "mara-elferrat",
                                "elferrat",
                                "mara",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "nadine-elferrat",
                                "elferrat",
                                "nadine",
                                sinceOn: JoinedIn2017,
                                untilOn: LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetManagedGroupById,
            GetManagedGroupByIdRequest,
            GetManagedGroupByIdResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("elferrat") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Members);
        Assert.Empty(result.Admins);
        var mara = Assert.Single(result.PastMembers);
        Assert.Equal(ctx.Groups.GroupMemberships.IdOf("mara-elferrat"), mara.GroupMembershipId);
        Assert.Equal(LeftIn2020, mara.LeftOn);
        var nadine = Assert.Single(result.PastAdmins);
        Assert.Equal(ctx.Groups.GroupAdmins.IdOf("nadine-elferrat"), nadine.GroupAdminId);
        Assert.Equal(LeftIn2020, nadine.UntilOn);
    }

    [Fact]
    public async Task Should_CarryTheChainMinimum_When_APersonRejoinedTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-first",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership(
                                "paula-second",
                                "tanzgarde",
                                "paula",
                                RejoinedIn2021
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetManagedGroupById,
            GetManagedGroupByIdRequest,
            GetManagedGroupByIdResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var running = Assert.Single(result.Members);
        Assert.Equal(ctx.Groups.GroupMemberships.IdOf("paula-second"), running.GroupMembershipId);
        Assert.Equal(RejoinedIn2021, running.JoinedOn);
        Assert.Equal(JoinedIn2017, running.Since);
        var past = Assert.Single(result.PastMembers);
        Assert.Equal(ctx.Groups.GroupMemberships.IdOf("paula-first"), past.GroupMembershipId);
    }

    [Fact]
    public async Task Should_CarryTheGruppe_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "kindergarde",
                                "Kindergarde",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2022
                            )
                            .AddGroupMembership(
                                "paula-kindergarde",
                                "kindergarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetManagedGroupById,
            GetManagedGroupByIdRequest,
            GetManagedGroupByIdResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ArchivedIn2022, result.ArchivedOn);
        var paula = Assert.Single(result.Members);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.GETAsync<
            GetManagedGroupById,
            GetManagedGroupByIdRequest,
            GetManagedGroupByIdResponse
        >(new() { GroupId = UnknownGroupId });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldGroupsManage()
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
        var (response, _) = await client.GETAsync<
            GetManagedGroupById,
            GetManagedGroupByIdRequest,
            GetManagedGroupByIdResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetManagedGroupById, GetManagedGroupByIdRequest, GetManagedGroupByIdResponse>(
                new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
