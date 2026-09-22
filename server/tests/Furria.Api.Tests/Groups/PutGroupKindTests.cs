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
public sealed class PutGroupKindTests
{
    private const string ConflictField = "conflict";
    private const string DuplicateNameMessage = "Diese Gruppenart gibt es schon.";
    private const string ArchivedKindMessage =
        "Eine archivierte Gruppenart kann nicht bearbeitet werden.";
    private const int UnknownGroupKindId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutGroupKindTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RenameKindAsync(
        HttpClient client,
        int groupKindId,
        string name
    ) =>
        client.PUTAsync<PutGroupKind, PutGroupKindRequest>(
            new PutGroupKindRequest { GroupKindId = groupKindId, Name = name }
        );

    [Fact]
    public async Task Should_RenameTheGruppenart_When_AManagerSharpensTheWord()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroupKind("garde", "Garde")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameKindAsync(
            client,
            ctx.Groups.GroupKinds.IdOf("garde"),
            "Tanzgarde"
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToHaveName("Tanzgarde")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheGruppenZugeordnet_When_TheGruppenartIsRenamed()
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
        var response = await RenameKindAsync(client, ctx.Groups.GroupKinds.IdOf("garde"), "Garden");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupKinds()
            .ToCountGruppenOf(ctx.Groups.GroupKinds.IdOf("garde"), 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherRunningGruppenartCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroupKind("garde", "Garde").AddGroupKind("elferrat", "Elferrat")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameKindAsync(
            client,
            ctx.Groups.GroupKinds.IdOf("elferrat"),
            "garde"
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNameMessage], failures[ConflictField]);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("elferrat"))
            .ToHaveName("Elferrat")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGruppenartIsArchived()
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
        var response = await RenameKindAsync(
            client,
            ctx.Groups.GroupKinds.IdOf("spielmannszug"),
            "Spielmannszüge"
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedKindMessage], failures[ConflictField]);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("spielmannszug"))
            .ToHaveName("Spielmannszug")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppenartIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameKindAsync(client, UnknownGroupKindId, "Garde");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheNameIsBlank()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroupKind("garde", "Garde")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameKindAsync(client, ctx.Groups.GroupKinds.IdOf("garde"), "");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToHaveName("Garde")
            .AssertAsync(ct);
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
        var response = await RenameKindAsync(
            client,
            ctx.Groups.GroupKinds.IdOf("garde"),
            "Tanzgarde"
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToHaveName("Garde")
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

        var response = await RenameKindAsync(
            _fixture.CreateClient(),
            ctx.Groups.GroupKinds.IdOf("garde"),
            "Tanzgarde"
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToHaveName("Garde")
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
