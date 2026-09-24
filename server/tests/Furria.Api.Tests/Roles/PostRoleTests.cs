using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Roles;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Roles;

[Collection("Api")]
public sealed class PostRoleTests
{
    private const string ConflictField = "conflict";
    private const string DuplicateNameMessage = "Eine Rolle mit diesem Namen gibt es schon.";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostRoleTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<PostRoleResponse>> CreateRoleAsync(
        HttpClient client,
        string name,
        string description
    ) =>
        client.POSTAsync<PostRole, PostRoleRequest, PostRoleResponse>(
            new PostRoleRequest { Name = name, Description = description }
        );

    [Fact]
    public async Task Should_CreateTheRoleWithoutKeys_When_AManagerAddsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await CreateRoleAsync(
            client,
            "Zeugwart",
            "Hütet das Material des Vereins."
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Role(result.RoleId)
            .ToHaveName("Zeugwart")
            .Role(result.RoleId)
            .ToHaveDescription("Hütet das Material des Vereins.")
            .Role(result.RoleId)
            .ToBeArchivedOn(null)
            .Role(result.RoleId)
            .ToGrantExactly()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnActiveRoleAlreadyCarriesTheNameInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Roles(roles => roles.AddRole("zeugwart", "Zeugwart")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await CreateRoleAsync(client, "zeugwart", "Noch einmal dasselbe.");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNameMessage], failures[ConflictField]);
        await ctx.Expected.Roles().ToHaveNameCount("zeugwart", 0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateTheRole_When_TheRoleThatUsedTheNameIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRoleWithDetails(
                        "zeugwart-retired",
                        "Zeugwart",
                        "Die alte Rolle.",
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await CreateRoleAsync(client, "Zeugwart", "Die neue Rolle.");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(ctx.Roles.Roles.IdOf("zeugwart-retired"), result.RoleId);
        await ctx.Expected.Role(result.RoleId).ToBeArchivedOn(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await CreateRoleAsync(client, "", "Ohne Namen.");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsLongerThanTheColumn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await CreateRoleAsync(client, new string('A', 81), "Zu lang.");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldRolesManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
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
        var (response, _) = await CreateRoleAsync(client, "Zeugwart", "Neue Rolle.");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Roles().ToHaveNameCount("Zeugwart", 0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var (response, _) = await CreateRoleAsync(
            _fixture.CreateClient(),
            "Zeugwart",
            "Neue Rolle."
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx.Expected.Roles().ToHaveNameCount("Zeugwart", 0).AssertAsync(ct);
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
