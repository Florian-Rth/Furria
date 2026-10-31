using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class PutClubStageTests : IClassFixture<ApiTestFixture>
{
    private const string ValidationField = "request";
    private const string UnreadableArtworkMessage =
        "Diese Bühnenzeichnung ist keine lesbare SVG-Datei.";
    private const string Artwork =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 12 8\">"
        + "<rect width=\"12\" height=\"8\" />"
        + "</svg>";
    private const string ArtworkCarryingAScript =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 12 8\">"
        + "<script>alert(1)</script>"
        + "<rect width=\"12\" height=\"8\" />"
        + "</svg>";
    private const string TornArtwork = "<svg><rect width=\"12\"></svg>";

    private readonly ApiTestFixture _fixture;

    public PutClubStageTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StoreTheSizeAndTheArtworkWithoutTheScript_When_TheStageIsWritten()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club => club.SetClubRecord(name: "Großfurraer Carnevals Club e.V.")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await WriteAsync(client, 12.5m, 8m, ArtworkCarryingAScript);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveStage(12.5m, 8m, Artwork)
            .ClubRecord()
            .ToHaveName("Großfurraer Carnevals Club e.V.")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DropTheArtwork_When_TheStageIsRewrittenWithoutOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await WriteAsync(client, 12m, 8m, Artwork);

        var response = await WriteAsync(client, 10m, 6m, null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.ClubRecord().ToHaveStage(10m, 6m, null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheStageAsItWas_When_TheArtworkIsNotReadable()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await WriteAsync(client, 12m, 8m, Artwork);

        var response = await WriteAsync(client, 10m, 6m, TornArtwork);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([UnreadableArtworkMessage], failures[ValidationField]);
        await ctx.Expected.ClubRecord().ToHaveStage(12m, 8m, Artwork).AssertAsync(ct);
    }

    [Theory]
    [InlineData(1.9, 8)]
    [InlineData(12, 40.1)]
    public async Task Should_ReturnBadRequest_When_ASideLiesOutsideTheRange(
        decimal widthMetres,
        decimal depthMetres
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await WriteAsync(client, widthMetres, depthMetres, null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx.Expected.ClubRecord().ToNotExist().AssertAsync(ct);
    }

    private static Task<HttpResponseMessage> WriteAsync(
        HttpClient client,
        decimal widthMetres,
        decimal depthMetres,
        string? artworkSvg
    ) =>
        client.PUTAsync<PutClubStage, PutClubStageRequest>(
            new()
            {
                WidthMetres = widthMetres,
                DepthMetres = depthMetres,
                ArtworkSvg = artworkSvg,
            }
        );

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
