using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Events;
using Furria.Application.Management;
using Furria.Infrastructure.Events;
using Furria.Infrastructure.Management;

namespace Furria.Api.Endpoints.TicketRequests;

public sealed class GetTicketRequests : EndpointWithoutRequest<GetTicketRequestsResponse>
{
    private readonly TicketRequestService _ticketRequestService;
    private readonly ToDoService _toDoService;

    public GetTicketRequests(TicketRequestService ticketRequestService, ToDoService toDoService)
    {
        _ticketRequestService = ticketRequestService;
        _toDoService = toDoService;
    }

    public override void Configure()
    {
        Get("ticket-requests");
        Definition.RequirePermission(FurriaPermissions.TicketRequestsHandle);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var requests = await _ticketRequestService.GetOpenAsync(ct);
        var toDo = (await _toDoService.ForAsync(accountId.Value, ct)).SingleOrDefault(item =>
            item.Kind == ToDoKind.TicketRequestWaiting
        );

        await Send.OkAsync(ToResponse(requests, toDo), cancellation: ct);
    }

    private static GetTicketRequestsResponse ToResponse(
        IReadOnlyList<TicketRequestSummary> requests,
        ToDoSummary? toDo
    ) =>
        new()
        {
            TicketRequests = [.. requests.Select(ToDto)],
            ToDo = toDo is null ? null : ToDto(toDo),
        };

    private static TicketRequestSummaryDto ToDto(TicketRequestSummary request) =>
        new()
        {
            TicketRequestId = request.TicketRequestId,
            EventId = request.EventId,
            EventTitle = request.EventTitle,
            EventStartsAt = request.EventStartsAt,
            TicketCount = request.TicketCount,
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            Message = request.Message,
            RequestedAt = request.RequestedAt,
        };

    private static TicketRequestToDoDto ToDto(ToDoSummary toDo) =>
        new()
        {
            Kind = toDo.Kind,
            Count = toDo.Count,
            IsSeen = toDo.IsSeen,
            NewCount = toDo.NewCount,
            Version = toDo.Version,
        };
}

public sealed record GetTicketRequestsResponse
{
    public required IReadOnlyList<TicketRequestSummaryDto> TicketRequests { get; init; }

    public required TicketRequestToDoDto? ToDo { get; init; }
}

public sealed record TicketRequestSummaryDto
{
    public required int TicketRequestId { get; init; }

    public required int EventId { get; init; }

    public required string EventTitle { get; init; }

    public required DateTimeOffset EventStartsAt { get; init; }

    public required int TicketCount { get; init; }

    public required string Name { get; init; }

    public required string Phone { get; init; }

    public required string Email { get; init; }

    public required string? Message { get; init; }

    public required DateTimeOffset RequestedAt { get; init; }
}

public sealed record TicketRequestToDoDto
{
    public required ToDoKind Kind { get; init; }

    public required int Count { get; init; }

    public required bool IsSeen { get; init; }

    public required int NewCount { get; init; }

    public required string Version { get; init; }
}
