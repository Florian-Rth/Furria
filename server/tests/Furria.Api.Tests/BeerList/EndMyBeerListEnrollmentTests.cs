using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class EndMyBeerListEnrollmentTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly MemberSince2018 = new(2018, 4, 1);

    private readonly ApiTestFixture _fixture;

    public EndMyBeerListEnrollmentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EndHerEnrollmentInHerOwnName_When_SheLeaves()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("mira")
                            .AddMembership("mira-first", "mira", MemberSince2018)
                    )
                    .BeerList(beerList => beerList.AddBeerListEnrollment("mira-bier", "mira")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, _) = await client.POSTAsync<EndMyBeerListEnrollment, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerListEnrollment(ctx.BeerList.Enrollments.IdOf("mira-bier"))
            .ToBeEnded(_fixture.TimeProvider.GetUtcNow(), ctx.Identity.People.IdOf("mira"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheIsNotEnrolled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("mira").AddMembership("mira-first", "mira", MemberSince2018)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var (response, _) = await client.POSTAsync<EndMyBeerListEnrollment, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
