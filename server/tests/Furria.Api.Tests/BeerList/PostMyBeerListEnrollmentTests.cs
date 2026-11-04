using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.BeerList;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class PostMyBeerListEnrollmentTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly MemberSince2018 = new(2018, 4, 1);

    private readonly ApiTestFixture _fixture;

    public PostMyBeerListEnrollmentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EnrollHer_When_SheConfirmsTheDeclaration()
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
        var response = await client.POSTAsync<
            PostMyBeerListEnrollment,
            PostMyBeerListEnrollmentRequest
        >(new() { ConfirmsDeclaration = true });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerListEnrollmentsOfPerson(ctx.Identity.People.IdOf("mira"))
            .ToHaveRunningSince(_fixture.TimeProvider.GetUtcNow())
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_SheDoesNotConfirmTheDeclaration()
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
        var response = await client.POSTAsync<
            PostMyBeerListEnrollment,
            PostMyBeerListEnrollmentRequest
        >(new() { ConfirmsDeclaration = false });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.BeerListEnrollmentsOfPerson(ctx.Identity.People.IdOf("mira"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheIsAlreadyEnrolled()
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
        var response = await client.POSTAsync<
            PostMyBeerListEnrollment,
            PostMyBeerListEnrollmentRequest
        >(new() { ConfirmsDeclaration = true });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BeerListEnrollmentsOfPerson(ctx.Identity.People.IdOf("mira"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepHerHistory_When_SheEnrollsAgainAfterLeaving()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("mira")
                            .AddMembership("mira-first", "mira", MemberSince2018)
                    )
                    .BeerList(beerList =>
                        beerList.AddBeerListEnrollment(
                            "mira-bier",
                            "mira",
                            now.AddDays(-90),
                            now.AddDays(-10),
                            "mira"
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mira", ct);
        var response = await client.POSTAsync<
            PostMyBeerListEnrollment,
            PostMyBeerListEnrollmentRequest
        >(new() { ConfirmsDeclaration = true });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.BeerListEnrollmentsOfPerson(ctx.Identity.People.IdOf("mira"))
            .ToHaveCount(2)
            .BeerListEnrollmentsOfPerson(ctx.Identity.People.IdOf("mira"))
            .ToHaveRunningSince(now)
            .BeerListEnrollment(ctx.BeerList.Enrollments.IdOf("mira-bier"))
            .ToBeEnded(now.AddDays(-10), ctx.Identity.People.IdOf("mira"))
            .AssertAsync(ct);
    }
}
