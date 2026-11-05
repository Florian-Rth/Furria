using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Api.Endpoints.Halls;
using Furria.Api.Endpoints.TablePlans;
using Furria.Core.Halls;

namespace Furria.Api.Tests.Halls;

internal static class HallSteps
{
    internal static async Task<int> CreateHallAsync(HttpClient client, int venueId, string name)
    {
        var (response, result) = await client.POSTAsync<
            PostHall,
            PostHallRequest,
            PostHallResponse
        >(new() { VenueId = venueId, Name = name });
        response.EnsureSuccessStatusCode();

        return result.HallId;
    }

    internal static async Task CreatePlanAsync(
        HttpClient client,
        int eventId,
        int hallId,
        int? copyFromEventId = null
    )
    {
        var response = await client.POSTAsync<PostTablePlan, PostTablePlanRequest>(
            new()
            {
                EventId = eventId,
                HallId = hallId,
                CopyFromEventId = copyFromEventId,
            }
        );
        response.EnsureSuccessStatusCode();
    }

    internal static async Task<GetEventByIdResponse> EventOfAsync(HttpClient client, int eventId)
    {
        var (response, result) = await client.GETAsync<
            GetEventById,
            GetEventByIdRequest,
            GetEventByIdResponse
        >(new() { EventId = eventId });
        response.EnsureSuccessStatusCode();

        return result;
    }

    internal static Task<TestResult<PutTablePlanResponse>> SavePlanAsync(
        HttpClient client,
        int eventId,
        int hallId,
        int version,
        IReadOnlyList<TableRowDto> rows,
        IReadOnlyList<TableGroupDto>? groups = null,
        int chairs = 0,
        int? tables = null
    ) =>
        client.PUTAsync<PutTablePlan, PutTablePlanRequest, PutTablePlanResponse>(
            new()
            {
                EventId = eventId,
                HallId = hallId,
                Version = version,
                Tables = tables ?? rows.Sum(row => row.Count),
                Chairs = chairs,
                Document = new TablePlanDocumentDto
                {
                    Seating = SeatingMode.Comfortable,
                    Rows = rows,
                    Groups = groups ?? [],
                },
            }
        );

    internal static async Task<int> SavedPlanAsync(
        HttpClient client,
        int eventId,
        int hallId,
        int version,
        IReadOnlyList<TableRowDto> rows,
        int chairs = 0
    )
    {
        var (response, result) = await SavePlanAsync(
            client,
            eventId,
            hallId,
            version,
            rows,
            chairs: chairs
        );
        response.EnsureSuccessStatusCode();

        return result.Version;
    }

    internal static TableRowDto Row(
        string id,
        int tableTypeId,
        int count,
        bool front = true,
        bool back = true,
        string? groupId = null
    ) =>
        new()
        {
            Id = id,
            TableTypeId = tableTypeId,
            Count = count,
            X = 500,
            Y = 400,
            Rotation = 0,
            Seating = null,
            GroupId = groupId,
            Sides = new TableRowSidesDto
            {
                Front = front,
                Back = back,
                Start = false,
                End = false,
            },
            Number = null,
            Note = null,
            Chairs = [],
        };

    internal static HallElementDto Wall(string id) =>
        new()
        {
            Id = id,
            Kind = HallElementKind.Wall,
            Points =
            [
                new PlanPointDto { X = 0, Y = 0 },
                new PlanPointDto { X = 2_000, Y = 0 },
                new PlanPointDto { X = 2_000, Y = 1_500 },
            ],
            ThicknessCm = 24,
        };

    internal static HallElementDto Stage(string id) =>
        new()
        {
            Id = id,
            Kind = HallElementKind.Area,
            Area = HallAreaKind.Stage,
            X = 1_000,
            Y = 200,
            WidthCm = 800,
            HeightCm = 300,
            Rotation = 0,
            Label = "Bühne",
        };

    internal static HallElementDto MergedStage(string id, params (double X, double Y)[] corners) =>
        new()
        {
            Id = id,
            Kind = HallElementKind.Area,
            Area = HallAreaKind.Stage,
            Shape = HallAreaShape.Polygon,
            Points = [.. corners.Select(corner => new PlanPointDto { X = corner.X, Y = corner.Y })],
            Label = "Bühne",
        };
}
