using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActEveningChoreography : Endpoint<DeleteActEveningChoreographyRequest>
{
    private readonly ActEveningService _eveningService;

    public DeleteActEveningChoreography(ActEveningService eveningService)
    {
        _eveningService = eveningService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/evenings/{eventId}/choreography");
    }

    public override async Task HandleAsync(
        DeleteActEveningChoreographyRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _eveningService.DropChoreographyAsync(
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

public sealed record DeleteActEveningChoreographyRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class DeleteActEveningChoreographyValidator
    : Validator<DeleteActEveningChoreographyRequest>
{
    public DeleteActEveningChoreographyValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}
