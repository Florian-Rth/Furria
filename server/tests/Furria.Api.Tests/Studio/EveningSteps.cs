using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Endpoints.RunningOrders;
using Xunit;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

internal static class EveningSteps
{
    internal static Task<HttpResponseMessage> DanceHereAsync(
        HttpClient client,
        int actId,
        int eventId
    ) =>
        client.PUTAsync<PutActEvening, PutActEveningRequest>(
            new() { ActId = actId, EventId = eventId }
        );

    internal static Task<HttpResponseMessage> StopDancingHereAsync(
        HttpClient client,
        int actId,
        int eventId
    ) =>
        client.DELETEAsync<DeleteActEveningById, DeleteActEveningByIdRequest>(
            new() { ActId = actId, EventId = eventId }
        );

    internal static Task<HttpResponseMessage> CastForEveningAsync(
        HttpClient client,
        int actId,
        int eventId,
        int personId,
        bool dances
    ) =>
        client.PUTAsync<PutActEveningCast, PutActEveningCastRequest>(
            new()
            {
                ActId = actId,
                EventId = eventId,
                PersonId = personId,
                Dances = dances,
            }
        );

    internal static Task<HttpResponseMessage> AssignEveningSpotAsync(
        HttpClient client,
        int actId,
        int eventId,
        int spotId,
        int? personId
    ) =>
        client.PUTAsync<PutActEveningSpot, PutActEveningSpotRequest>(
            new()
            {
                ActId = actId,
                EventId = eventId,
                SpotId = spotId,
                PersonId = personId,
            }
        );

    internal static async Task<(
        HttpResponseMessage Response,
        int Version
    )> SaveEveningChoreographyAsync(
        HttpClient client,
        int actId,
        int eventId,
        int? expectedVersion,
        int? sessionVersion,
        IReadOnlyList<ChoreographyTrackDataDto> tracks
    )
    {
        var (response, result) = await client.PUTAsync<
            PutActEveningChoreography,
            PutActEveningChoreographyRequest,
            PutActEveningChoreographyResponse
        >(
            new()
            {
                ActId = actId,
                EventId = eventId,
                ExpectedVersion = expectedVersion,
                SessionVersion = sessionVersion,
                Tracks = tracks,
            }
        );

        return (response, response.IsSuccessStatusCode ? result.Version : 0);
    }

    internal static Task<HttpResponseMessage> DropEveningChoreographyAsync(
        HttpClient client,
        int actId,
        int eventId
    ) =>
        client.DELETEAsync<DeleteActEveningChoreography, DeleteActEveningChoreographyRequest>(
            new() { ActId = actId, EventId = eventId }
        );

    internal static async Task<StudioEveningDto> EveningOfAsync(
        HttpClient client,
        int actId,
        int eventId
    ) =>
        Assert.Single(
            (await StudioOfAsync(client, actId)).Studio!.Evenings,
            evening => evening.EventId == eventId
        );

    internal static async Task<GetRunningOrderResponse> AblaufOfAsync(
        HttpClient client,
        int eventId
    )
    {
        var (response, result) = await client.GETAsync<
            GetRunningOrder,
            GetRunningOrderRequest,
            GetRunningOrderResponse
        >(new() { EventId = eventId });
        response.EnsureSuccessStatusCode();

        return result;
    }
}
