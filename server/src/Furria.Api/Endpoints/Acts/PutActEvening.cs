using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActEvening : Endpoint<PutActEveningRequest>
{
    private readonly ActEveningService _eveningService;

    public PutActEvening(ActEveningService eveningService)
    {
        _eveningService = eveningService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/evenings/{eventId}");
    }

    public override async Task HandleAsync(PutActEveningRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _eveningService.JoinAsync(
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

public sealed record PutActEveningRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int EventId { get; init; }
}

public sealed class PutActEveningValidator : Validator<PutActEveningRequest>
{
    public PutActEveningValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.EventId).GreaterThan(0);
    }
}
