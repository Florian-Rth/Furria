using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Events;
using Furria.Core.Events;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.Events;

public sealed class GetEvents : EndpointWithoutRequest<GetEventsResponse>
{
    private readonly EventService _eventService;

    public GetEvents(EventService eventService)
    {
        _eventService = eventService;
    }

    public override void Configure()
    {
        Get("events");
        Definition.RequirePermission(FurriaPermissions.EventsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var events = await _eventService.GetRelevantEventsAsync(ct);

        await Send.OkAsync(ToResponse(events), cancellation: ct);
    }

    private static GetEventsResponse ToResponse(IReadOnlyList<EventSummary> events) =>
        new() { Events = [.. events.Select(ToDto)] };

    private static EventSummaryDto ToDto(EventSummary listed) =>
        new()
        {
            EventId = listed.EventId,
            Title = listed.Title,
            StartsAt = listed.StartsAt,
            EndsAt = listed.EndsAt,
            VenueName = listed.VenueName,
            PresaleStartsAt = listed.PresaleStartsAt,
            Status = listed.Status,
            IsOver = listed.IsOver,
        };
}

public sealed record GetEventsResponse
{
    public required IReadOnlyList<EventSummaryDto> Events { get; init; }
}

public sealed record EventSummaryDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required string? VenueName { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }

    public required EventSalesStatus Status { get; init; }

    public required bool IsOver { get; init; }
}
