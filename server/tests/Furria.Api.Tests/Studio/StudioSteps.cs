using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Tests.Media;
using Furria.Core.RunningOrders;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.Studio;

internal static class StudioSteps
{
    private const int SongLength = 4096;
    private const int VideoLength = 4096;

    internal static async Task<int> GardetanzAsync(
        SeededContext ctx,
        CancellationToken ct,
        IReadOnlyList<int>? added = null,
        IReadOnlyList<int>? removed = null,
        string name = "Gardetanz"
    )
    {
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        return await CreateActAsync(
            admin,
            name,
            ctx.Groups.Groups.IdOf(Garde),
            ActKind.Dance,
            added: added,
            removed: removed
        );
    }

    internal static async Task<GetActStudioResponse> StudioOfAsync(HttpClient client, int actId)
    {
        var (response, result) = await client.GETAsync<
            GetActStudio,
            GetActStudioRequest,
            GetActStudioResponse
        >(new() { ActId = actId });
        response.EnsureSuccessStatusCode();

        return result;
    }

    internal static async Task GrantCoEditorAsync(HttpClient client, int actId, int personId)
    {
        var response = await client.PUTAsync<PutActCoEditor, PutActCoEditorRequest>(
            new() { ActId = actId, PersonId = personId }
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    internal static Task<int> UploadSongAsync(
        HttpClient client,
        int actId,
        CancellationToken ct,
        string fileName = "Gardemarsch.wav"
    ) =>
        TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.ActOwner(actId),
            fileName,
            MediaSamples.Wav(SongLength),
            SongLength,
            ct
        );

    internal static async Task<int> AddSongAsync(HttpClient client, int actId, int mediaItemId)
    {
        var (response, result) = await client.POSTAsync<
            PostActSong,
            PostActSongRequest,
            PostActSongResponse
        >(new() { ActId = actId, MediaItemId = mediaItemId });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.SongId;
    }

    internal static async Task<int> AddedSongAsync(
        HttpClient client,
        int actId,
        CancellationToken ct
    ) => await AddSongAsync(client, actId, await UploadSongAsync(client, actId, ct));

    internal static async Task SongOfAsync(
        ApiTestFixture fixture,
        HttpClient client,
        int actId,
        double seconds,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadSongAsync(client, actId, ct);
        await fixture.RenderSongDirectlyAsync(mediaItemId, seconds, ct);
        await AddSongAsync(client, actId, mediaItemId);
    }

    internal static async Task<IReadOnlyList<int>> MarkAsync(
        HttpClient client,
        int actId,
        double atSeconds
    )
    {
        var (response, result) = await client.POSTAsync<
            PostActStep,
            PostActStepRequest,
            PostActStepResponse
        >(new() { ActId = actId, AtSeconds = atSeconds });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.StepIds;
    }

    internal static async Task<IReadOnlyList<int>> MarkedAsync(
        HttpClient client,
        int actId,
        params double[] marks
    )
    {
        foreach (var mark in marks)
            await MarkAsync(client, actId, mark);

        return [.. (await StudioOfAsync(client, actId)).Studio!.Steps.Select(step => step.StepId)];
    }

    internal static async Task<int> AddPartAsync(
        HttpClient client,
        int actId,
        int firstStepId,
        string name
    )
    {
        var (response, result) = await client.POSTAsync<
            PostActPart,
            PostActPartRequest,
            PostActPartResponse
        >(
            new()
            {
                ActId = actId,
                FirstStepId = firstStepId,
                Name = name,
            }
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.PartId;
    }

    internal static async Task<int[][]> PartStepsOfAsync(HttpClient client, int actId) =>
        [
            .. (await StudioOfAsync(client, actId)).Studio!.Parts.Select(part =>
                part.StepIds.ToArray()
            ),
        ];

    internal static async Task<(double? Start, double? End)[]> StepSpansOfAsync(
        HttpClient client,
        int actId
    ) =>
        [
            .. (await StudioOfAsync(client, actId)).Studio!.Steps.Select(step =>
                (step.StartSeconds, step.EndSeconds)
            ),
        ];

    internal static Task<int> UploadVideoAsync(
        HttpClient client,
        int actId,
        CancellationToken ct,
        string fileName = "Probe.mp4"
    ) =>
        TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.ActOwner(actId),
            fileName,
            MediaSamples.Mp4(VideoLength),
            VideoLength,
            ct
        );

    internal static async Task<int> AddVideoAsync(HttpClient client, int actId, int mediaItemId)
    {
        var (response, result) = await client.POSTAsync<
            PostActVideo,
            PostActVideoRequest,
            PostActVideoResponse
        >(new() { ActId = actId, MediaItemId = mediaItemId });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.VideoId;
    }

    internal static async Task<int> VideoOfAsync(
        ApiTestFixture fixture,
        HttpClient client,
        int actId,
        double seconds,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadVideoAsync(client, actId, ct);
        await fixture.RenderSongDirectlyAsync(mediaItemId, seconds, ct);

        return await AddVideoAsync(client, actId, mediaItemId);
    }

    internal static async Task PlaceVideoAsync(
        HttpClient client,
        int actId,
        int videoId,
        double atSeconds
    )
    {
        var response = await client.PUTAsync<PutActVideoStart, PutActVideoStartRequest>(
            new()
            {
                ActId = actId,
                VideoId = videoId,
                AtSeconds = atSeconds,
            }
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    internal static async Task<StudioVideoDto> VideoInStudioAsync(
        HttpClient client,
        int actId,
        int videoId
    ) =>
        (await StudioOfAsync(client, actId)).Studio!.Videos.Single(video =>
            video.VideoId == videoId
        );
}
