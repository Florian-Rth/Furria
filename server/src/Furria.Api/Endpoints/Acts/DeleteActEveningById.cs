using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActEveningById : Endpoint<DeleteActEveningByIdRequest>
{
    private readonly ActEveningService _eveningService;

    public DeleteActEveningById(ActEveningService eveningService)
    {
        _eveningService = eveningService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/evenings/{eventId}");
    }

    public override async Task HandleAsync(DeleteActEveningByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _eveningService.LeaveAsync(
            accountId.Value,
            new ActEveningCommand { ActId = req.ActId, EventId = req.EventId },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteActEveningByIdRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class DeleteActEveningByIdValidator : Validator<DeleteActEveningByIdRequest>
{
    public DeleteActEveningByIdValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}
