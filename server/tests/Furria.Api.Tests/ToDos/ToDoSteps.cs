using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Keys;
using Furria.Api.Endpoints.Management;
using Furria.Api.Endpoints.ToDos;
using Furria.Application.Management;
using Xunit;

namespace Furria.Api.Tests.ToDos;

internal static class ToDoSteps
{
    public static async Task<IReadOnlyList<ManageHubToDoDto>> ToDosOfAsync(HttpClient client)
    {
        var (response, hub) = await client.GETAsync<GetManageHub, GetManageHubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return hub.ToDos;
    }

    public static async Task<ManageHubToDoDto?> ToDoOfAsync(HttpClient client, ToDoKind kind) =>
        (await ToDosOfAsync(client)).SingleOrDefault(toDo => toDo.Kind == kind);

    public static async Task<ManageHubToDoDto> ShownToDoOfAsync(HttpClient client, ToDoKind kind)
    {
        var toDo = await ToDoOfAsync(client, kind);

        Assert.NotNull(toDo);
        return toDo;
    }

    public static Task<HttpResponseMessage> MarkSeenAsync(
        HttpClient client,
        ToDoKind kind,
        string version
    ) =>
        client.PUTAsync<PutToDoSeen, PutToDoSeenRequest>(
            new PutToDoSeenRequest { Kind = kind, Version = version }
        );

    public static async Task MarkShownAsSeenAsync(HttpClient client, ToDoKind kind)
    {
        var shown = await ShownToDoOfAsync(client, kind);

        var response = await MarkSeenAsync(client, kind, shown.Version);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    public static Task<HttpResponseMessage> UnmarkSeenAsync(HttpClient client, ToDoKind kind) =>
        client.DELETEAsync<DeleteToDoSeen, DeleteToDoSeenRequest>(
            new DeleteToDoSeenRequest { Kind = kind }
        );

    public static async Task HandOutKeyAsync(
        HttpClient keyWarden,
        int venueId,
        int personId,
        DateOnly sinceOn
    )
    {
        var (response, _) = await keyWarden.POSTAsync<
            PostKeyHolding,
            PostKeyHoldingRequest,
            PostKeyHoldingResponse
        >(
            new PostKeyHoldingRequest
            {
                VenueId = venueId,
                PersonId = personId,
                SinceOn = sinceOn,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    public static async Task TakeBackKeyAsync(
        HttpClient keyWarden,
        int keyHoldingId,
        DateOnly untilOn
    )
    {
        var response = await keyWarden.POSTAsync<EndKeyHolding, EndKeyHoldingRequest>(
            new EndKeyHoldingRequest { KeyHoldingId = keyHoldingId, UntilOn = untilOn }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
