using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Core.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class PutGroupInfoTests
{
    private const string NewDescription = "Wir tanzen dienstags und donnerstags in der Turnhalle.";
    private const string OldDescription = "Die Garde tanzt seit 1971.";
    private const string ConflictField = "conflict";
    private const int UnknownGroupId = 999_999;
    private const int UnknownGroupKindId = 999_999;
    private const int FoundedIn1971 = 1971;
    private const string ValidationField = "request";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutGroupInfoTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteDescriptionAndOpenness_When_TheGruppenAdminSaves()
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
                            .AddGroup("tanzgarde", "Tanzgarde", "Die Garde tanzt seit 1971.")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna", "Trainerin")
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
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(NewDescription)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeRecruiting(true)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveName("Tanzgarde")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ClearTheDescription_When_TheGruppenAdminSavesAnEmptyText()
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
                            .AddGroup("tanzgarde", "Tanzgarde", OldDescription, isRecruiting: true)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Description = "",
                IsRecruiting = false,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription("")
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeRecruiting(false)
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
                        identity.AddPerson("mara", "Mara", "Lenz").AddAccount("mara")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", OldDescription)
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var response = await client.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Description = NewDescription,
                IsRecruiting = true,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(OldDescription)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerAdministersAnotherGruppe()
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
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(OldDescription)
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
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("ilka")
                    )
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde", OldDescription))
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
        var response = await client.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                Description = NewDescription,
                IsRecruiting = true,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(NewDescription)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("ilka")
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
        var response = await client.PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
            new()
            {
                GroupId = UnknownGroupId,
                Description = NewDescription,
                IsRecruiting = true,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheGruppeIsArchived()
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
    public async Task Should_ReturnBadRequest_When_TheDescriptionIsLongerThanTheColumn()
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
                Description = new string('a', 401),
                IsRecruiting = true,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(OldDescription)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("anna", "Anna", "Kaiser"))
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde", OldDescription)),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .PUTAsync<PutGroupInfo, PutGroupInfoRequest>(
                new()
                {
                    GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                    Description = NewDescription,
                    IsRecruiting = true,
                    GroupKindId = null,
                    FoundedYear = null,
                    Tone = null,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_WriteTheSteckbrief_When_TheGruppenAdminNamesArtJahrUndFarbe()
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
                            .AddGroupKind("garden", "Garden")
                            .AddGroup("tanzgarde", "Tanzgarde", OldDescription)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna", "Trainerin")
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
                GroupKindId = ctx.Groups.GroupKinds.IdOf("garden"),
                FoundedYear = FoundedIn1971,
                Tone = GroupTone.Rose,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveGroupKind(ctx.Groups.GroupKinds.IdOf("garden"))
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveFoundedYear(FoundedIn1971)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveTone(GroupTone.Rose)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ClearTheSteckbrief_When_TheGruppenAdminUnsetsArtJahrUndFarbe()
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
                            .AddGroupKind("garden", "Garden")
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                OldDescription,
                                groupKindAlias: "garden",
                                foundedYear: FoundedIn1971,
                                tone: GroupTone.Teal
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
                Description = OldDescription,
                IsRecruiting = false,
                GroupKindId = null,
                FoundedYear = null,
                Tone = null,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveGroupKind(null)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveFoundedYear(null)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveTone(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppenartIsUnknown()
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
                GroupKindId = UnknownGroupKindId,
                FoundedYear = null,
                Tone = null,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription(OldDescription)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheYear_When_TheGruendungLiesInTheFuture()
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
    public async Task Should_ReturnBadRequest_When_TheGruendungsjahrIsBeforeTheColumnFloor()
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
                FoundedYear = 1799,
                Tone = null,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveFoundedYear(null)
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
