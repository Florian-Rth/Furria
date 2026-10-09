using System.Net;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class AbandonedUploadSweepTests : IClassFixture<ApiTestFixture>
{
    private const int UploadLength = 4096;

    private readonly ApiTestFixture _fixture;

    public AbandonedUploadSweepTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DiscardTheStagedUpload_When_NobodyTouchedItForADay()
    {
        var ct = TestContext.Current.CancellationToken;
        var (client, upload) = await HalfUploadedPortraitAsync(ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(25),
            () =>
            {
                _fixture.SweepAbandonedUploads();
                return Task.CompletedTask;
            }
        );

        var response = await TusUploadSteps.HeadAsync(client, upload, ct);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_KeepTheStagedUpload_When_ItWasTouchedWithinADay()
    {
        var ct = TestContext.Current.CancellationToken;
        var (client, upload) = await HalfUploadedPortraitAsync(ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(23),
            () =>
            {
                _fixture.SweepAbandonedUploads();
                return Task.CompletedTask;
            }
        );

        var response = await TusUploadSteps.HeadAsync(client, upload, ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private async Task<(HttpClient Client, Uri Upload)> HalfUploadedPortraitAsync(
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var upload = await TusUploadSteps.CreatedAsync(
            client,
            TusUploadSteps.PersonOwner(ctx.Identity.People.IdOf("alice")),
            "ich.jpg",
            UploadLength,
            ct
        );
        var response = await TusUploadSteps.PatchAsync(
            client,
            upload,
            0,
            MediaSamples.Jpeg(UploadLength / 2),
            ct
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        return (client, upload);
    }
}
