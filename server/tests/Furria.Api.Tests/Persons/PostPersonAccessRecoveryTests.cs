using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class PostPersonAccessRecoveryTests
{
    private const string ConflictField = "conflict";
    private const string CodePattern = "^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$";
    private const int UnknownPersonId = 999_999;

    private readonly ApiTestFixture _fixture;

    public PostPersonAccessRecoveryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnTheLinkAndTheCodeForFifteenMinutes_When_SheHasAnAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var issued = await InvitationSteps.IssueRecoveryAsync(manager, annaId);

        Assert.StartsWith(
            $"{ApiTestFixture.ClubAppBaseUrl}/invitation#token=",
            issued.Link,
            StringComparison.Ordinal
        );
        Assert.Matches(CodePattern, issued.Code);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow().AddMinutes(15), issued.ExpiresAt);
        await ctx
            .Expected.LiveInvitationOfPerson(annaId)
            .ToBeRecoveryIssuedBy(null)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.RecoveryIssued)
            .AccountEventsOfPerson(annaId)
            .ToHaveNoLatestActor()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KillTheFirstCode_When_ASecondRecoveryIsIssued()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var first = await InvitationSteps.IssueRecoveryAsync(manager, annaId);
        var second = await InvitationSteps.IssueRecoveryAsync(manager, annaId);

        var anonymous = _fixture.CreateClient();
        var (_, firstLookup) = await InvitationSteps.LookUpByCodeAsync(anonymous, first.Code);
        var (_, secondLookup) = await InvitationSteps.LookUpByCodeAsync(anonymous, second.Code);
        Assert.Equal(InvitationLookupStatus.Dead, firstLookup.Status);
        Assert.Equal(InvitationLookupStatus.Live, secondLookup.Status);
        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(2)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheHasNoAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );

        await AssertRefusedAsync(ctx, "anna", "Anna hat noch keinen Zugang.", ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_HerAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("anna", "Anna", "Muster").AddAccount("anna", disabled: true)
                ),
            ct
        );

        await AssertRefusedAsync(
            ctx,
            "anna",
            "Der Zugang von Anna ist gesperrt. Entsperre ihn zuerst.",
            ct
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyHoldsPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("anna")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "personenpflege",
                            "ilka-personenpflege",
                            "Personenpflege",
                            "ilka",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var (response, _) = await PostAsync(client, annaId);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_IssueTheRecovery_When_TheCallerOnlyHoldsAccountsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("anna")
                            .AddPerson("vera", "Vera", "Vorstand")
                            .AddAccount("vera")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "zugangspflege",
                            "vera-zugangspflege",
                            "Zugangspflege",
                            "vera",
                            FurriaPermissions.AccountsManage
                        )
                    ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var client = await ctx.Identity.ClientForAsync("vera", ct);

        var (response, _) = await PostAsync(client, annaId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.LiveInvitationOfPerson(annaId)
            .ToBeRecoveryIssuedBy(ctx.Identity.People.IdOf("vera"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await PostAsync(manager, UnknownPersonId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<TestResult<PostPersonAccessRecoveryResponse>> PostAsync(
        HttpClient client,
        int personId
    ) =>
        client.POSTAsync<
            PostPersonAccessRecovery,
            PostPersonAccessRecoveryRequest,
            PostPersonAccessRecoveryResponse
        >(new PostPersonAccessRecoveryRequest { PersonId = personId });

    private static async Task AssertRefusedAsync(
        SeededContext ctx,
        string alias,
        string expectedMessage,
        CancellationToken ct
    )
    {
        var personId = ctx.Identity.People.IdOf(alias);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await PostAsync(manager, personId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.Equal([expectedMessage], payload?.Errors[ConflictField]);
        await ctx.Expected.InvitationsOfPerson(personId).ToHaveCount(0).AssertAsync(ct);
    }
}
