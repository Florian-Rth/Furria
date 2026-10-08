using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Management;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PutPersonAccountDisabledTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const int UnknownPersonId = 999_999;

    private readonly ApiTestFixture _fixture;

    public PutPersonAccountDisabledTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EndEverySessionAndShutHerOut_When_HerAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeManagerOfGroupsAsync(ct);
        var annaId = ctx.Identity.People.IdOf("anna");
        var loginEmail = ctx.Identity.EmailOf("anna");
        var session = await ctx.Identity.LogInAsync(
            loginEmail,
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        var signedIn = ClientCarrying(session.AccessToken);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await InvitationSteps.SetAccountDisabledAsync(manager, annaId, true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, await LogInStatusAsync(loginEmail));
        var (refreshResponse, _) = await _fixture
            .CreateClient()
            .POSTAsync<Refresh, RefreshRequest, RefreshResponse>(
                new RefreshRequest { RefreshToken = session.RefreshToken }
            );
        Assert.Equal(HttpStatusCode.Unauthorized, refreshResponse.StatusCode);
        var (meResponse, _) = await signedIn.GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.Unauthorized, meResponse.StatusCode);
        var (hubResponse, _) = await signedIn.GETAsync<GetManageHub, GetManageHubResponse>();
        Assert.Equal(HttpStatusCode.Forbidden, hubResponse.StatusCode);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToBeDisabled(true)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveActiveCount(0)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveRevocationCount(RefreshTokenRevocationReason.AllSessionsEnded, 1)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Disabled)
            .AccountEventsOfPerson(annaId)
            .ToHaveNoLatestActor()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_VoidTheOpenRecovery_When_HerAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var recovery = await InvitationSteps.IssueRecoveryAsync(manager, annaId);

        await InvitationSteps.SetAccountDisabledAsync(manager, annaId, true);

        var (_, lookup) = await InvitationSteps.LookUpByCodeAsync(
            _fixture.CreateClient(),
            recovery.Code
        );
        Assert.Equal(InvitationLookupStatus.Dead, lookup.Status);
        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveLiveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LetHerSignInAgainWithoutRestoringSessions_When_HerAccountIsEnabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var loginEmail = ctx.Identity.EmailOf("anna");
        var session = await ctx.Identity.LogInAsync(
            loginEmail,
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.SetAccountDisabledAsync(manager, annaId, true);

        var response = await InvitationSteps.SetAccountDisabledAsync(manager, annaId, false);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (refreshResponse, _) = await _fixture
            .CreateClient()
            .POSTAsync<Refresh, RefreshRequest, RefreshResponse>(
                new RefreshRequest { RefreshToken = session.RefreshToken }
            );
        Assert.Equal(HttpStatusCode.Unauthorized, refreshResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, await LogInStatusAsync(loginEmail));
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToBeDisabled(false)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Disabled, AccountEventKind.Enabled)
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData(false, false)]
    [InlineData(true, true)]
    public async Task Should_ChangeNothing_When_TheAccountAlreadyHasThatState(
        bool seededDisabled,
        bool requestedDisabled
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna", seededDisabled)),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await InvitationSteps.SetAccountDisabledAsync(
            manager,
            annaId,
            requestedDisabled
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToBeDisabled(seededDisabled)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AManagerDisablesHerOwnAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeHolderOfAsync(FurriaPermissions.AccountsManage, ct);
        var ilkaId = ctx.Identity.People.IdOf("ilka");
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await InvitationSteps.SetAccountDisabledAsync(ilka, ilkaId, true);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.Equal(
            ["Deinen eigenen Zugang kannst du nicht sperren. Das muss jemand anderes tun."],
            payload?.Errors[ConflictField]
        );
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("ilka"))
            .ToBeDisabled(false)
            .AccountEventsOfPerson(ilkaId)
            .ToHaveKindsInOrder()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheHasNoAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("anna", "Anna", "Muster")),
            ct
        );
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await InvitationSteps.SetAccountDisabledAsync(
            manager,
            ctx.Identity.People.IdOf("anna"),
            true
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.Equal(["Anna hat keinen Zugang."], payload?.Errors[ConflictField]);
    }

    [Fact]
    public async Task Should_DisableTheAccount_When_TheCallerOnlyHoldsAccountsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeHolderOfAsync(FurriaPermissions.AccountsManage, ct);
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await InvitationSteps.SetAccountDisabledAsync(
            client,
            ctx.Identity.People.IdOf("anna"),
            true
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToBeDisabled(true)
            .AccountEventsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveLatestActor(ctx.Identity.People.IdOf("ilka"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await InvitationSteps.SetAccountDisabledAsync(
            manager,
            UnknownPersonId,
            true
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private Task<SeededContext> ArrangeManagerOfGroupsAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Muster")
                            .AddMembership("anna-membership", "anna", _fixture.Today.AddYears(-1))
                            .AddAccount("anna")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "anna-gruppenpflege",
                            "Gruppenpflege",
                            "anna",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

    private Task<SeededContext> ArrangeHolderOfAsync(string permissionKey, CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Muster")
                            .AddAccount("anna")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "teilpflege",
                            "ilka-teilpflege",
                            "Teilpflege",
                            "ilka",
                            permissionKey
                        )
                    ),
            ct
        );

    private HttpClient ClientCarrying(string accessToken)
    {
        var client = _fixture.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );
        return client;
    }

    private async Task<HttpStatusCode> LogInStatusAsync(string email)
    {
        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<Login, LoginRequest, LoginResponse>(
                new LoginRequest { Email = email, Password = ApiTestFixture.SeededAccountPassword }
            );

        return response.StatusCode;
    }
}
