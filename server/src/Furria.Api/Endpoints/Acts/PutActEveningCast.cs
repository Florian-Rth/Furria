using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActEveningCast : Endpoint<PutActEveningCastRequest>
{
    private readonly ActEveningService _eveningService;

    public PutActEveningCast(ActEveningService eveningService)
    {
        _eveningService = eveningService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/evenings/{eventId}/cast/{personId}");
    }

    public override async Task HandleAsync(PutActEveningCastRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _eveningService.SetCastAsync(
            accountId.Value,
            new EveningCastCommand
            {
                Evening = new ActEveningCommand { ActId = req.ActId, EventId = req.EventId },
                PersonId = req.PersonId,
                Dances = req.Dances,
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

public sealed record PutActEveningCastRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int EventId { get; init; }

    [RouteParam]
    public required int PersonId { get; init; }

    public required bool Dances { get; init; }
}

public sealed class PutActEveningCastValidator : Validator<PutActEveningCastRequest>
{
    public PutActEveningCastValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
