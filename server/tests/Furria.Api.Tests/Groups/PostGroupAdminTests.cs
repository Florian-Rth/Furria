using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class PostGroupAdminTests
{
    private const string ConflictField = "conflict";
    private const int UnknownGroupId = 999_999;
    private const int UnknownPersonId = 999_998;

    private static readonly DateOnly AppointedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly AppointedIn2023 = new(2023, 9, 1);
    private static readonly DateOnly EndedIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostGroupAdminTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenTheErnennung_When_TheGruppenAdminAppointsAPerson()
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
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = "Trainerin",
                SinceOn = AppointedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(result.GroupAdminId)
            .ToHavePeriod(AppointedIn2017, null)
            .GroupAdmin(result.GroupAdminId)
            .ToHaveFunction("Trainerin")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePersonIsAlreadyGruppenAdmin()
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
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: AppointedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = null,
                SinceOn = AppointedIn2023,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Diese Person ist bereits Gruppen-Admin dieser Gruppe."],
            failures[ConflictField]
        );
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheErnennungOverlapsAnEndedOne()
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
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: AppointedIn2017,
                                untilOn: EndedIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = null,
                SinceOn = AppointedIn2017.AddYears(1),
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            [
                "Dieser Zeitraum überschneidet sich mit einer bestehenden Ernennung. "
                    + "Eine erneute Ernennung beginnt frühestens am Tag nach dem Ende der vorigen.",
            ],
            failures[ConflictField]
        );
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppeIsUnknown()
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
        var (response, _) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = UnknownGroupId,
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = null,
                SinceOn = AppointedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
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
        var (response, _) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = UnknownPersonId,
                Function = null,
                SinceOn = AppointedIn2017,
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
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", archivedOn: ArchivedIn2021)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = null,
                SinceOn = AppointedIn2023,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppe kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.GroupAdminsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(1)
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
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("mara")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = null,
                SinceOn = AppointedIn2023,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GroupAdminsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(0)
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
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = "Kommandantin",
                SinceOn = AppointedIn2023,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(result.GroupAdminId)
            .ToHavePeriod(AppointedIn2023, null)
            .GroupAdmin(result.GroupAdminId)
            .ToHaveFunction("Kommandantin")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheErnennungStartsOnTheDayTheLastOneEnded()
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
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: AppointedIn2017,
                                untilOn: EndedIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = null,
                SinceOn = EndedIn2020,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.GroupAdminsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenTheErnennung_When_ItStartsTheDayAfterTheLastOneEnded()
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
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: AppointedIn2017,
                                untilOn: EndedIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = null,
                SinceOn = EndedIn2020.AddDays(1),
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(result.GroupAdminId)
            .ToHavePeriod(EndedIn2020.AddDays(1), null)
            .GroupAdminsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveOpenCount(2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenTheErnennung_When_ThePersonIsNeitherMitgliedNorInTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("jonas", "Jonas", "Weber")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin("anna-kindergarde", "kindergarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("kindergarde"),
                PersonId = ctx.Identity.People.IdOf("jonas"),
                Function = null,
                SinceOn = AppointedIn2023,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(result.GroupAdminId)
            .ToHaveFunction(null)
            .GroupAdmin(result.GroupAdminId)
            .ToHavePeriod(AppointedIn2023, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenTheErnennung_When_ItStartsInTheFuture()
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
                    ),
            ct
        );

        var startsNextYear = _fixture.Today.AddYears(1);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = null,
                SinceOn = startsNextYear,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(result.GroupAdminId)
            .ToHavePeriod(startsNextYear, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheFunktionIsTooLong()
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
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = ctx.Identity.People.IdOf("paula"),
                Function = new string('a', 65),
                SinceOn = AppointedIn2023,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.GroupAdminsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_ThePersonIdIsNotAnId()
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
        var (response, _) = await client.POSTAsync<
            PostGroupAdmin,
            PostGroupAdminRequest,
            PostGroupAdminResponse
        >(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                PersonId = 0,
                Function = null,
                SinceOn = AppointedIn2023,
            }
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
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<PostGroupAdmin, PostGroupAdminRequest, PostGroupAdminResponse>(
                new()
                {
                    GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                    PersonId = ctx.Identity.People.IdOf("paula"),
                    Function = null,
                    SinceOn = AppointedIn2023,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.GroupAdminsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(0)
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
