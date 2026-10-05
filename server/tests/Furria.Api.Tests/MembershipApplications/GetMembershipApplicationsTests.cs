using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

[Collection("Api")]
public sealed class GetMembershipApplicationsTests
{
    private readonly ApiTestFixture _fixture;

    public GetMembershipApplicationsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheConfirmedApplicationsLongestWaitingFirst_When_TheyAreRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var adult = _fixture.Today.AddYears(-30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddMembershipApplication(
                            "lena",
                            adult,
                            "Lena",
                            "Spät",
                            confirmedAt: now - TimeSpan.FromDays(1)
                        )
                        .AddMembershipApplication(
                            "mia",
                            adult,
                            "Mia",
                            "Früh",
                            confirmedAt: now - TimeSpan.FromDays(3)
                        )
                        .AddMembershipApplication("nora", adult, "Nora", unconfirmed: true)
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, result) = await admin.GETAsync<
            GetMembershipApplications,
            GetMembershipApplicationsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Identity.MembershipApplications.IdOf("mia"),
                ctx.Identity.MembershipApplications.IdOf("lena"),
            ],
            result.Applications.Select(application => application.MembershipApplicationId)
        );
        var mia = result.Applications[0];
        Assert.Equal("Mia", mia.FirstName);
        Assert.Equal("Früh", mia.LastName);
        Assert.Equal("Köln", mia.City);
        Assert.Equal(now - TimeSpan.FromDays(3), mia.ConfirmedAt);
    }

    [Fact]
    public async Task Should_MarkTheApplicantMinor_When_SheIsUnder18Today()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddMembershipApplication("mia", today.AddYears(-18).AddDays(1))
                        .AddMembershipApplication("lena", today.AddYears(-18))
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (_, result) = await admin.GETAsync<
            GetMembershipApplications,
            GetMembershipApplicationsResponse
        >();

        var mia = Assert.Single(
            result.Applications,
            application =>
                application.MembershipApplicationId
                == ctx.Identity.MembershipApplications.IdOf("mia")
        );
        var lena = Assert.Single(
            result.Applications,
            application =>
                application.MembershipApplicationId
                == ctx.Identity.MembershipApplications.IdOf("lena")
        );
        Assert.True(mia.IsMinor);
        Assert.Equal(17, mia.Age);
        Assert.False(lena.IsMinor);
        Assert.Equal(18, lena.Age);
    }

    [Fact]
    public async Task Should_ListTheApplications_When_TheCallerOnlyDecidesApplications()
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

        var (response, result) = await client.GETAsync<
            GetMembershipApplications,
            GetMembershipApplicationsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ctx.Identity.MembershipApplications.IdOf("mia"),
            Assert.Single(result.Applications).MembershipApplicationId
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyManagesPersons()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("paul"))
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

        var (response, _) = await client.GETAsync<
            GetMembershipApplications,
            GetMembershipApplicationsResponse
        >();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetMembershipApplications, GetMembershipApplicationsResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
