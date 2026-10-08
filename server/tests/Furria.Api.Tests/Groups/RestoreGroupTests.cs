using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class RestoreGroupTests
{
    private const string ConflictField = "conflict";
    private const string RetiredDescription = "Die alte Garde.";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public RestoreGroupTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ClearTheArchivedOn_When_TheKeyHolderRestoresTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroup(
                        "kindergarde",
                        "Kindergarde",
                        RetiredDescription,
                        isRecruiting: false,
                        ArchivedIn2021
                    )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("kindergarde") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("kindergarde"))
            .ToBeArchivedOn(null)
            .Group(ctx.Groups.Groups.IdOf("kindergarde"))
            .ToHaveName("Kindergarde")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LiftTheArchiveOfEveryoneWhoseTieRunsAgain_When_TheGroupIsRestored()
    {
        var ct = TestContext.Current.CancellationToken;
        var joinedIn2015 = new DateOnly(2015, 9, 1);
        var leftIn2019 = new DateOnly(2019, 6, 30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddArchive("paula", ArchivedIn2021)
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddArchive("ilka", ArchivedIn2021)
                            .AddPerson("anna", "Anna", "Vogt")
                            .AddArchive("anna", ArchivedIn2021)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedIn2021)
                            .AddGroupMembership("paula-altgarde", "altgarde", "paula", joinedIn2015)
                            .AddGroupAdmin("ilka-altgarde", "altgarde", "ilka", "Trainerin")
                            .AddGroupMembership(
                                "anna-altgarde",
                                "altgarde",
                                "anna",
                                joinedIn2015,
                                leftIn2019
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("altgarde") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .Person(ctx.Identity.People.IdOf("ilka"))
            .ToNotBeArchived()
            .Person(ctx.Identity.People.IdOf("anna"))
            .ToBeArchived(ArchivedIn2021, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGroupIsNotArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Gruppe ist nicht archiviert."], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherActiveGroupNowCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup(
                            "tanzgarde-retired",
                            "Tanzgarde",
                            RetiredDescription,
                            isRecruiting: false,
                            ArchivedIn2021
                        )
                        .AddGroup("tanzgarde", "tanzgarde")
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("tanzgarde-retired") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Eine Gruppe mit diesem Namen gibt es schon."], failures[ConflictField]);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde-retired"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheGroup_When_ItsGroupKindIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("spielmannszug", "Spielmannszug", archivedOn: ArchivedIn2021)
                        .AddGroup(
                            "spielleute",
                            "Spielleute",
                            RetiredDescription,
                            isRecruiting: false,
                            ArchivedIn2021,
                            groupKindAlias: "spielmannszug"
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<RestoreGroup, RestoreGroupRequest>(
            new() { GroupId = ctx.Groups.Groups.IdOf("spielleute") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            [
                "Die Gruppenart dieser Gruppe ist archiviert. "
                    + "Hole zuerst die Gruppenart zurück.",
            ],
            failures[ConflictField]
        );
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("spielleute"))
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
