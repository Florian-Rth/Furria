using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class RestoreActEveningChoreographyVersion
    : Endpoint<
        RestoreActEveningChoreographyVersionRequest,
        RestoreActEveningChoreographyVersionResponse
    >
{
    private readonly ActEveningService _eveningService;

    public RestoreActEveningChoreographyVersion(ActEveningService eveningService)
    {
        _eveningService = eveningService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/evenings/{eventId}/choreography/versions/{version}/restore");
    }

    public override async Task HandleAsync(
        RestoreActEveningChoreographyVersionRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _eveningService.RestoreChoreographyAsync(
            accountId.Value,
            new RestoreEveningChoreographyCommand
            {
                Evening = new ActEveningCommand { ActId = req.ActId, EventId = req.EventId },
                Version = req.Version,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new RestoreActEveningChoreographyVersionResponse { Version = result.Value },
            cancellation: ct
        );
    }
}

public sealed record RestoreActEveningChoreographyVersionRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int EventId { get; init; }

    [RouteParam]
    public required int Version { get; init; }
}

public sealed class RestoreActEveningChoreographyVersionValidator
    : Validator<RestoreActEveningChoreographyVersionRequest>
{
    public RestoreActEveningChoreographyVersionValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.Version).GreaterThanOrEqualTo(Choreography.FirstVersion);
    }
}

public sealed record RestoreActEveningChoreographyVersionResponse
{
    public required int Version { get; init; }
}
