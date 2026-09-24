using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class EndGroupAdminTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int UnknownTenureId = 999_999;

    private static readonly DateOnly AppointedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly EndedIn2026 = new(2026, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public EndGroupAdminTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseTheTenure_When_TheCallerIsTheGroupAdmin()
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
                                "Trainerin",
                                AppointedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, EndedIn2026)
            .GroupAdminsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheTenureBelongsToAnotherGroup()
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
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                            .AddGroupAdmin(
                                "paula-elferrat",
                                "elferrat",
                                "paula",
                                sinceOn: AppointedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-elferrat"),
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-elferrat"))
            .ToHavePeriod(AppointedIn2017, null)
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
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", archivedOn: ArchivedIn2021)
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
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine archivierte Gruppe kann nicht bearbeitet werden."],
            failures[ConflictField]
        );
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheTenureIsAlreadyEnded()
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
                                untilOn: EndedIn2026
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = EndedIn2026.AddYears(1),
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Ernennung ist bereits beendet."], failures[ConflictField]);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, EndedIn2026)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessable_When_TheEndLiesBeforeTheTenure()
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
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = AppointedIn2017.AddDays(-1),
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine Ernennung kann nicht vor ihrem Beginn enden."],
            failures[ValidationField]
        );
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyBelongsToTheGroup()
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
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: AppointedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, null)
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
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: AppointedIn2017
                            )
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
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, EndedIn2026)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CloseTheTenure_When_TheEndIsTheTenureDay()
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
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                EndedOn = AppointedIn2017,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, AppointedIn2017)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveTheGroupWithoutAdmin_When_TheLastAdminEndsHerOwnTenure()
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
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                sinceOn: AppointedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = ctx.Groups.GroupAdmins.IdOf("anna-tanzgarde"),
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupAdminsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveOpenCount(0)
            .GroupAdmin(ctx.Groups.GroupAdmins.IdOf("anna-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, EndedIn2026)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheTenureIsUnknown()
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
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = UnknownTenureId,
                EndedOn = EndedIn2026,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTenureIdIsNotAnId()
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
        var response = await client.POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
            new()
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                GroupAdminId = 0,
                EndedOn = EndedIn2026,
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
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: AppointedIn2017
                            )
                    ),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .POSTAsync<EndGroupAdmin, EndGroupAdminRequest>(
                new()
                {
                    GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                    GroupAdminId = ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"),
                    EndedOn = EndedIn2026,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde"))
            .ToHavePeriod(AppointedIn2017, null)
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
