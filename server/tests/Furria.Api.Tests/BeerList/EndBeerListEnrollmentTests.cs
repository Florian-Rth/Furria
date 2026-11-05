using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class EndBeerListEnrollmentTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public EndBeerListEnrollmentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EndTheEnrollmentInTheOperatorsName_When_AnOperatorEndsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .Identity(identity => identity.AddPerson("mira", "Mira", "Lenz"))
                    .BeerList(beerList => beerList.AddBeerListEnrollment("mira-bier", "mira")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var response = await client.POSTAsync<EndBeerListEnrollment, EndBeerListEnrollmentRequest>(
            new() { EnrollmentId = ctx.BeerList.Enrollments.IdOf("mira-bier") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerListEnrollment(ctx.BeerList.Enrollments.IdOf("mira-bier"))
            .ToBeEnded(_fixture.TimeProvider.GetUtcNow(), ctx.Identity.People.IdOf("greta"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheEnrollmentHasAlreadyEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                WithWarden(builder)
                    .Identity(identity => identity.AddPerson("mira", "Mira", "Lenz"))
                    .BeerList(beerList =>
                        beerList.AddBeerListEnrollment(
                            "mira-bier",
                            "mira",
                            now.AddDays(-40),
                            now.AddDays(-3),
                            "mira"
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("greta", ct);
        var response = await client.POSTAsync<EndBeerListEnrollment, EndBeerListEnrollmentRequest>(
            new() { EnrollmentId = ctx.BeerList.Enrollments.IdOf("mira-bier") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerListEnrollment(ctx.BeerList.Enrollments.IdOf("mira-bier"))
            .ToBeEnded(now.AddDays(-3), ctx.Identity.People.IdOf("mira"))
            .AssertAsync(ct);
    }

    private static SeedContextBuilder WithWarden(SeedContextBuilder builder) =>
        builder
            .Identity(identity => identity.AddAccount("greta"))
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "getraenkewart",
                    "greta-getraenkewart",
                    "Getränkewart",
                    "greta",
                    FurriaPermissions.BeerListManage
                )
            );
}
