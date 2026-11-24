using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class GetMembershipApplicationsTests : IClassFixture<ApiTestFixture>
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

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
}
