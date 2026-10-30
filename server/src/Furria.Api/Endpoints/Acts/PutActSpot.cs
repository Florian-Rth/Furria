using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActSpot : Endpoint<PutActSpotRequest>
{
    private readonly ActSpotService _spotService;

    public PutActSpot(ActSpotService spotService)
    {
        _spotService = spotService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/spots/{spotId}");
    }

    public override async Task HandleAsync(PutActSpotRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _spotService.AssignAsync(
            accountId.Value,
            new AssignSpotCommand
            {
                ActId = req.ActId,
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

public sealed record PutActSpotRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int SpotId { get; init; }

    public required int? PersonId { get; init; }
}

public sealed class PutActSpotValidator : Validator<PutActSpotRequest>
{
    public PutActSpotValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SpotId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
