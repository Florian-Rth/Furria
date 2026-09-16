using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class EndGroupMembershipTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int UnknownZugehoerigkeitId = 999_999;

    private static readonly DateOnly JoinedOn = new(2017, 9, 1);
    private static readonly DateOnly EndedOn = new(2026, 3, 1);
    private static readonly DateOnly ArchivedOn = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public EndGroupMembershipTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseTheZugehoerigkeit_When_TheCallerIsTheGruppenAdmin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna", "Trainerin")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToHavePeriod(JoinedOn, EndedOn)
            .GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveOpenCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheZugehoerigkeitIsAlreadyEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedOn,
                                EndedOn
                            )
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Zugehörigkeit ist bereits beendet."], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnUnprocessable_When_TheEndLiesBeforeTheBeitritt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = JoinedOn.AddDays(-1),
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine Zugehörigkeit kann nicht vor ihrem Beginn enden."],
            failures[ValidationField]
        );
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CloseTheZugehoerigkeit_When_TheEndIsTheBeitrittsTag()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = JoinedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToHavePeriod(JoinedOn, JoinedOn)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGruppeIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", archivedOn: ArchivedOn)
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppe kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyBelongsToTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddAccount("mara")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara", JoinedOn)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToBeOpen()
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
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
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
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToHavePeriod(JoinedOn, EndedOn)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheZugehoerigkeitBelongsToAnotherGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupMembership("paula-elferrat", "elferrat", "paula", JoinedOn)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-elferrat"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-elferrat"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheZugehoerigkeitIsUnknown()
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
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = UnknownZugehoerigkeitId,
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheZugehoerigkeitIdIsNotAnId()
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
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = 0,
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(
            request
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
                    ),
            ct
        );

        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await _fixture
            .CreateClient()
            .POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToBeOpen()
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
