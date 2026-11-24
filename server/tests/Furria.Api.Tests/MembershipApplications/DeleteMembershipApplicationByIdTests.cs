using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class DeleteMembershipApplicationByIdTests : IClassFixture<ApiTestFixture>
{
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
