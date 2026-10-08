using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Events;

namespace Furria.Api.Endpoints.TicketRequests;

public sealed class DeleteTicketRequestById : Endpoint<DeleteTicketRequestByIdRequest>
{
    private readonly TicketRequestService _ticketRequestService;

    public DeleteTicketRequestById(TicketRequestService ticketRequestService)
    {
        _ticketRequestService = ticketRequestService;
    }

    public override void Configure()
    {
        Delete("ticket-requests/{ticketRequestId}");
        Definition.RequirePermission(FurriaPermissions.TicketRequestsHandle);
    }

    public override async Task HandleAsync(DeleteTicketRequestByIdRequest req, CancellationToken ct)
    {
        var result = await _ticketRequestService.HandleAsync(req.TicketRequestId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteTicketRequestByIdRequest
{
    [RouteParam]
    public required int TicketRequestId { get; init; }
}

public sealed class DeleteTicketRequestByIdValidator : Validator<DeleteTicketRequestByIdRequest>
{
    public DeleteTicketRequestByIdValidator()
    {
        RuleFor(request => request.TicketRequestId).GreaterThan(0);
    }
}
