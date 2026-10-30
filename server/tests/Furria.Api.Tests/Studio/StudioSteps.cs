using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Tests.Media;
using Furria.Core.RunningOrders;
using Furria.Core.Studio;
using Furria.Tests.Common.Builder;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.Studio;

internal static class StudioSteps
{
    private const int SongLength = 4096;

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

    internal static async Task<int> AddSpotAsync(HttpClient client, int actId)
    {
        var (response, result) = await client.POSTAsync<
            PostActSpot,
            PostActSpotRequest,
            PostActSpotResponse
        >(new() { ActId = actId });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.SpotId;
    }

    internal static Task<HttpResponseMessage> AssignSpotAsync(
        HttpClient client,
        int actId,
        int spotId,
        int? personId
    ) =>
        client.PUTAsync<PutActSpot, PutActSpotRequest>(
            new()
            {
                ActId = actId,
                SpotId = spotId,
                PersonId = personId,
            }
        );

    internal static async Task<(HttpResponseMessage Response, int Version)> SaveChoreographyAsync(
        HttpClient client,
        int actId,
        int? expectedVersion,
        IReadOnlyList<ChoreographyTrackDataDto> tracks
    )
    {
        var (response, result) = await client.PUTAsync<
            PutActChoreography,
            PutActChoreographyRequest,
            PutActChoreographyResponse
        >(
            new()
            {
                ActId = actId,
                ExpectedVersion = expectedVersion,
                Tracks = tracks,
            }
        );

        return (response, response.IsSuccessStatusCode ? result.Version : 0);
    }

    internal static ChoreographyTrackDataDto StandingTrack(
        int spotId,
        int songMediaItemId,
        double rightMetres,
        double backMetres
    ) =>
        new()
        {
            SpotId = spotId,
            Keyframes =
            [
                new()
                {
                    SourceMediaItemId = songMediaItemId,
                    Seconds = 1,
                    Position = new() { RightMetres = rightMetres, BackMetres = backMetres },
                    Bend = null,
                    Easing = KeyframeEasing.Linear,
                    FacingDegrees = null,
                },
            ],
        };

    internal static async Task<int> AddedSongAsync(
        HttpClient client,
        int actId,
        CancellationToken ct
    ) => await AddSongAsync(client, actId, await UploadSongAsync(client, actId, ct));
}
