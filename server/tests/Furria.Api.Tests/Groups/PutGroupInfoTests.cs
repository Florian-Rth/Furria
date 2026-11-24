using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Core.Groups;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class PutGroupInfoTests : IClassFixture<ApiTestFixture>
{
    private const string NewDescription = "Wir tanzen dienstags und donnerstags in der Turnhalle.";
    private const string OldDescription = "Die Garde tanzt seit 1971.";
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutGroupInfoTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerAdministersAnotherGroup()
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
                            .AddGroup("tanzgarde", "Tanzgarde", OldDescription)
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupAdmin("anna-elferrat", "elferrat", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Description = NewDescription,
                IsRecruiting = true,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
                Icon = null,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(OldDescription)
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
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                OldDescription,
                                archivedOn: ArchivedIn2021
                            )
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Description = NewDescription,
                IsRecruiting = true,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
                Icon = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppe kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(OldDescription)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheYear_When_TheFoundingLiesInTheFuture()
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
                            .AddGroup("tanzgarde", "Tanzgarde", OldDescription)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Description = NewDescription,
                IsRecruiting = true,
                GroupKindId = null,
                FoundedYear = _fixture.Today.Year + 1,
                Tone = null,
                Icon = null,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine Gruppe kann nicht in der Zukunft gegründet worden sein."],
            failures[ValidationField]
        );
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveFoundedYear(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheGroupKind_When_ItIsArchived()
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
                            .AddGroupKind(
                                "spielmannszug",
                                "Spielmannszug",
                                archivedOn: ArchivedIn2021
                            )
                            .AddGroup("tanzgarde", "Tanzgarde", OldDescription)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Description = NewDescription,
                IsRecruiting = true,
                GroupKindId = ctx.Groups.GroupKinds.IdOf("spielmannszug"),
                FoundedYear = null,
                Tone = null,
                Icon = null,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppenart lässt sich einer Gruppe nicht zuordnen."],
            failures[ConflictField]
        );
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveGroupKind(null)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(OldDescription)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SaveTheName_When_OnlyItsCaseChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde", OldDescription)),
            ct
        );
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await PutInfoWithNameAsync(client, tanzgarde, "TANZGARDE");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Group(tanzgarde).ToHaveName("TANZGARDE").AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherActiveGroupCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("tanzgarde", "Tanzgarde", OldDescription)
                        .AddGroup("elferrat", "Elferrat", OldDescription)
                ),
            ct
        );
        var elferrat = ctx.Groups.Groups.IdOf("elferrat");

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await PutInfoWithNameAsync(client, elferrat, "tanzgarde");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Eine Gruppe mit diesem Namen gibt es schon."], failures[ConflictField]);
        await ctx
            .Expected.Group(elferrat)
            .ToHaveName("Elferrat")
            .Group(elferrat)
            .ToHaveDescription(OldDescription)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbiddenAndWriteNothing_When_AGroupAdminWithoutGroupsManageSendsAName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithTanzgardeAdminAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await PutInfoWithNameAsync(client, tanzgarde, "Große Garde");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Group(tanzgarde)
            .ToHaveName("Tanzgarde")
            .Group(tanzgarde)
            .ToHaveDescription(OldDescription)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheNameAndSave_When_AGroupAdminSendsNoName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithTanzgardeAdminAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await PutInfoWithNameAsync(client, tanzgarde, null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(tanzgarde)
            .ToHaveName("Tanzgarde")
            .Group(tanzgarde)
            .ToHaveDescription(NewDescription)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithTanzgardeAdminAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", OldDescription)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna", "Trainerin")
                    ),
            ct
        );

    private static Task<HttpResponseMessage> PutInfoWithNameAsync(
        HttpClient client,
        int groupId,
        string? name
    ) =>
        client.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = groupId,
                Name = name,
                Description = NewDescription,
                IsRecruiting = false,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
                Icon = null,
            }
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
