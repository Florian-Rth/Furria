using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class RestoreActChoreographyVersion
    : Endpoint<RestoreActChoreographyVersionRequest, RestoreActChoreographyVersionResponse>
{
    private readonly ActChoreographyService _choreographyService;

    public RestoreActChoreographyVersion(ActChoreographyService choreographyService)
    {
        _choreographyService = choreographyService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/choreography/versions/{version}/restore");
    }

    public override async Task HandleAsync(
        RestoreActChoreographyVersionRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _choreographyService.RestoreAsync(
            accountId.Value,
            new RestoreChoreographyCommand { ActId = req.ActId, Version = req.Version },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new RestoreActChoreographyVersionResponse { Version = result.Value },
            cancellation: ct
        );
    }
}

public sealed record RestoreActChoreographyVersionRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int Version { get; init; }
}

public sealed class RestoreActChoreographyVersionValidator
    : Validator<RestoreActChoreographyVersionRequest>
{
    public RestoreActChoreographyVersionValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.Version).GreaterThanOrEqualTo(Choreography.FirstVersion);
    }
}

public sealed record RestoreActChoreographyVersionResponse
{
    public required int Version { get; init; }
}
