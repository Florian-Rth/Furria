using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActEveningSpot : Endpoint<PutActEveningSpotRequest>
{
    private readonly ActEveningService _eveningService;

    public PutActEveningSpot(ActEveningService eveningService)
    {
        _eveningService = eveningService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/evenings/{eventId}/spots/{spotId}");
    }

    public override async Task HandleAsync(PutActEveningSpotRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _eveningService.AssignSpotAsync(
            accountId.Value,
            new EveningSpotCommand
            {
                Evening = new ActEveningCommand { ActId = req.ActId, EventId = req.EventId },
                SpotId = req.SpotId,
                PersonId = req.PersonId,
            },
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

public sealed record PutActEveningSpotRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int EventId { get; init; }

    [RouteParam]
    public required int SpotId { get; init; }

    public required int? PersonId { get; init; }
}

public sealed class PutActEveningSpotValidator : Validator<PutActEveningSpotRequest>
{
    public PutActEveningSpotValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.SpotId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
