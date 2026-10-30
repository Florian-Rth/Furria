using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActSpotById : Endpoint<DeleteActSpotByIdRequest>
{
    private readonly ActSpotService _spotService;

    public DeleteActSpotById(ActSpotService spotService)
    {
        _spotService = spotService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/spots/{spotId}");
    }

    public override async Task HandleAsync(DeleteActSpotByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _spotService.RemoveAsync(
            accountId.Value,
            new RemoveSpotCommand { ActId = req.ActId, SpotId = req.SpotId },
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

public sealed record DeleteActSpotByIdRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int SpotId { get; init; }
}

public sealed class DeleteActSpotByIdValidator : Validator<DeleteActSpotByIdRequest>
{
    public DeleteActSpotByIdValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SpotId).GreaterThan(0);
    }
}
