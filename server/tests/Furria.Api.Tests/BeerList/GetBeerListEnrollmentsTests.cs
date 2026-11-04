using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class GetBeerListEnrollmentsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetBeerListEnrollmentsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListRunningEnrollmentsByNameBeforeEndedOnes_When_AnOperatorAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("greta")
                            .AddPerson("ozan", "Ozan", "Öztürk")
                            .AddPerson("bert", "Bert", "Zander")
                            .AddPerson("anna", "Anna", "Adler")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "getraenkewart",
                            "greta-getraenkewart",
                            "Getränkewart",
                            "greta",
                            FurriaPermissions.BeerListManage
                        )
                    )
                    .BeerList(beerList =>
                        beerList
                            .AddBeerListEnrollment("bert-bier", "bert", now.AddDays(-5))
                            .AddBeerListEnrollment(
                                "anna-bier",
                                "anna",
                                now.AddDays(-60),
                                now.AddDays(-20),
                                "greta"
                            )
                            .AddBeerListEnrollment("ozan-bier", "ozan", now.AddDays(-9))
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var (response, result) = await client.GETAsync<
            GetBeerListEnrollments,
            GetBeerListEnrollmentsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.BeerList.Enrollments.IdOf("ozan-bier"),
                ctx.BeerList.Enrollments.IdOf("bert-bier"),
                ctx.BeerList.Enrollments.IdOf("anna-bier"),
            ],
            result.Enrollments.Select(enrollment => enrollment.EnrollmentId)
        );
        var ended = result.Enrollments[2];
        Assert.Equal(now.AddDays(-20), ended.EndedAt);
        Assert.Equal(ctx.Identity.People.IdOf("greta"), ended.EndedBy?.PersonId);
        Assert.Null(result.Enrollments[0].EndedBy);
    }
}
