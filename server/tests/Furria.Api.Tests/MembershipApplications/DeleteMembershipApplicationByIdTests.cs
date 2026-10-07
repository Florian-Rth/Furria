using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

[Collection("Api")]
public sealed class DeleteMembershipApplicationByIdTests
{
    private const int UnknownApplicationId = 999_999;

    private readonly ApiTestFixture _fixture;

    public DeleteMembershipApplicationByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteTheApplicationAtOnce_When_ItIsDeclined()
    {
        var ct = TestContext.Current.CancellationToken;
        var adult = _fixture.Today.AddYears(-30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddMembershipApplication("mia", adult)
                        .AddMembershipApplication("lena", adult, "Lena")
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await DeclineAsync(admin, ctx.Identity.MembershipApplications.IdOf("mia"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MembershipApplication(ctx.Identity.MembershipApplications.IdOf("mia"))
            .ToNotExist()
            .MembershipApplication(ctx.Identity.MembershipApplications.IdOf("lena"))
            .ToExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendTheApplicantNothing_When_SheIsDeclined()
    {
        var ct = TestContext.Current.CancellationToken;
        var miaEmail = InvitationSteps.UniqueContactEmail("mia");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddMembershipApplication(
                            "mia",
                            _fixture.Today.AddYears(-30),
                            email: miaEmail
                        )
                        .AddAccount("sentinel")
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        await DeclineAsync(admin, ctx.Identity.MembershipApplications.IdOf("mia"));
        await SignedOutMailSteps.SettleAsync(_fixture, ctx.Identity.EmailOf("sentinel"), ct);

        Assert.Empty(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, miaEmail, ct));
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheApplicantHasNotConfirmedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication(
                        "mia",
                        _fixture.Today.AddYears(-30),
                        unconfirmed: true
                    )
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await DeclineAsync(admin, ctx.Identity.MembershipApplications.IdOf("mia"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.MembershipApplication(ctx.Identity.MembershipApplications.IdOf("mia"))
            .ToExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheApplicationIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await DeclineAsync(admin, UnknownApplicationId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_DeclineTheApplication_When_TheCallerOnlyDecidesApplications()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("anna")
                            .AddMembershipApplication("mia", _fixture.Today.AddYears(-30))
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "aufnahme",
                            "anna-aufnahme",
                            "Aufnahme",
                            "anna",
                            FurriaPermissions.MembershipApplicationsDecide
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var response = await DeclineAsync(client, ctx.Identity.MembershipApplications.IdOf("mia"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MembershipApplication(ctx.Identity.MembershipApplications.IdOf("mia"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyManagesPersons()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("paul")
                            .AddMembershipApplication("mia", _fixture.Today.AddYears(-30))
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "personenpflege",
                            "paul-personenpflege",
                            "Personenpflege",
                            "paul",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("paul", ct);

        var response = await DeclineAsync(client, ctx.Identity.MembershipApplications.IdOf("mia"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.MembershipApplication(ctx.Identity.MembershipApplications.IdOf("mia"))
            .ToExist()
            .AssertAsync(ct);
    }

    private static Task<HttpResponseMessage> DeclineAsync(
        HttpClient client,
        int membershipApplicationId
    ) =>
        client.DELETEAsync<DeleteMembershipApplicationById, DeleteMembershipApplicationByIdRequest>(
            new DeleteMembershipApplicationByIdRequest
            {
                MembershipApplicationId = membershipApplicationId,
            }
        );
}
