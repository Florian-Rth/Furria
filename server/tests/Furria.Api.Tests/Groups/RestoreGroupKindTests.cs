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
public sealed class RestoreGroupKindTests
{
    private const string ConflictField = "conflict";
    private const string NotArchivedMessage = "Diese Gruppenart ist nicht archiviert.";
    private const string DuplicateNameMessage = "Diese Gruppenart gibt es schon.";
    private const int UnknownGroupKindId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public RestoreGroupKindTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RestoreKindAsync(HttpClient client, int groupKindId) =>
        client.POSTAsync<RestoreGroupKind, RestoreGroupKindRequest>(
            new RestoreGroupKindRequest { GroupKindId = groupKindId }
        );

    [Fact]
    public async Task Should_LetTheGroupKindBackIntoTheBand_When_TheManagerRestoresIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroupKind("spielmannszug", "Spielmannszug", ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RestoreKindAsync(client, ctx.Groups.GroupKinds.IdOf("spielmannszug"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("spielmannszug"))
            .ToBeOpen()
            .GroupKind(ctx.Groups.GroupKinds.IdOf("spielmannszug"))
            .ToHaveName("Spielmannszug")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ARunningGroupKindTookTheNameMeanwhile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("alter-zug", "Spielmannszug", ArchivedIn2021)
                        .AddGroupKind("neuer-zug", "Spielmannszug")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RestoreKindAsync(client, ctx.Groups.GroupKinds.IdOf("alter-zug"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNameMessage], failures[ConflictField]);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("alter-zug"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGroupKindIsNotArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroupKind("garde", "Garde")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RestoreKindAsync(client, ctx.Groups.GroupKinds.IdOf("garde"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([NotArchivedMessage], failures[ConflictField]);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGroupKindIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RestoreKindAsync(client, UnknownGroupKindId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("katrin"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "rechte",
                            "katrin-rechte",
                            "Rechte",
                            "katrin",
                            FurriaPermissions.RolesManage
                        )
                    )
                    .Groups(groups =>
                        groups.AddGroupKind("spielmannszug", "Spielmannszug", ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var response = await RestoreKindAsync(client, ctx.Groups.GroupKinds.IdOf("spielmannszug"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("spielmannszug"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroupKind("spielmannszug", "Spielmannszug", ArchivedIn2021)
                ),
            ct
        );

        var response = await RestoreKindAsync(
            _fixture.CreateClient(),
            ctx.Groups.GroupKinds.IdOf("spielmannszug")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("spielmannszug"))
            .ToBeArchivedOn(ArchivedIn2021)
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
