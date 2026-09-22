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
public sealed class ArchiveGroupKindTests
{
    private const string ConflictField = "conflict";
    private const string KindInUseMessage =
        "Diese Gruppenart ist in Benutzung. Ordne die Gruppen zuerst einer anderen Art zu.";
    private const string AlreadyArchivedMessage = "Diese Gruppenart ist bereits archiviert.";
    private const int UnknownGroupKindId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public ArchiveGroupKindTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> ArchiveKindAsync(HttpClient client, int groupKindId) =>
        client.POSTAsync<ArchiveGroupKind, ArchiveGroupKindRequest>(
            new ArchiveGroupKindRequest { GroupKindId = groupKindId }
        );

    [Fact]
    public async Task Should_ArchiveTheGruppenart_When_NoGruppeCarriesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups => groups.AddGroupKind("spielmannszug", "Spielmannszug")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveKindAsync(client, ctx.Groups.GroupKinds.IdOf("spielmannszug"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("spielmannszug"))
            .ToBeArchivedOn(_fixture.Today)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ArchiveTheGruppenart_When_OnlyAnArchivedGruppeUsesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("spielmannszug", "Spielmannszug")
                        .AddGroup(
                            "alter-zug",
                            "Alter Spielmannszug",
                            "Aufgeloest.",
                            isRecruiting: false,
                            ArchivedIn2021,
                            "spielmannszug"
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveKindAsync(client, ctx.Groups.GroupKinds.IdOf("spielmannszug"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("spielmannszug"))
            .ToBeArchivedOn(_fixture.Today)
            .Group(ctx.Groups.Groups.IdOf("alter-zug"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ARunningGruppeStillCarriesTheGruppenart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("garde", "Garde")
                        .AddGroup("tanzgarde", "Tanzgarde", groupKindAlias: "garde")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveKindAsync(client, ctx.Groups.GroupKinds.IdOf("garde"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([KindInUseMessage], failures[ConflictField]);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGruppenartIsAlreadyArchived()
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
        var response = await ArchiveKindAsync(client, ctx.Groups.GroupKinds.IdOf("spielmannszug"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([AlreadyArchivedMessage], failures[ConflictField]);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("spielmannszug"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppenartIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await ArchiveKindAsync(client, UnknownGroupKindId);

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
                    .Groups(groups => groups.AddGroupKind("garde", "Garde")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var response = await ArchiveKindAsync(client, ctx.Groups.GroupKinds.IdOf("garde"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroupKind("garde", "Garde")),
            ct
        );

        var response = await ArchiveKindAsync(
            _fixture.CreateClient(),
            ctx.Groups.GroupKinds.IdOf("garde")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
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
