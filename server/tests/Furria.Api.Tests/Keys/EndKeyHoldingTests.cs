using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Keys;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Keys;

public sealed class EndKeyHoldingTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";

    private static readonly DateOnly HeldSince2019 = new(2019, 2, 1);
    private static readonly DateOnly ReturnedIn2022 = new(2022, 6, 30);
    private static readonly DateOnly ReturnedIn2025 = new(2025, 5, 14);

    private readonly ApiTestFixture _fixture;

    public EndKeyHoldingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StampTheReturnDate_When_TheKeyIsReturned()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("maik", "Maik", "Perlberg"))
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("maik-lager", "lager", "maik", HeldSince2019)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<EndKeyHolding, EndKeyHoldingRequest>(
            new()
            {
                KeyHoldingId = ctx.Club.KeyHoldings.IdOf("maik-lager"),
                UntilOn = ReturnedIn2025,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("maik-lager"))
            .ToHavePeriod(HeldSince2019, ReturnedIn2025)
            .KeyHoldingsOfVenue(ctx.Club.Venues.IdOf("lager"))
            .ToHaveOpenCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheKeyIsAlreadyBack()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("maik", "Maik", "Perlberg"))
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding(
                                "maik-lager",
                                "lager",
                                "maik",
                                HeldSince2019,
                                ReturnedIn2022
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.POSTAsync<EndKeyHolding, EndKeyHoldingRequest>(
            new()
            {
                KeyHoldingId = ctx.Club.KeyHoldings.IdOf("maik-lager"),
                UntilOn = ReturnedIn2025,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Single((await ReadFailuresAsync(response, ct))[ConflictField]);
        await ctx
            .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("maik-lager"))
            .ToHavePeriod(HeldSince2019, ReturnedIn2022)
            .AssertAsync(ct);
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
