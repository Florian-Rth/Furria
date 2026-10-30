using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActFinalTrackById : Endpoint<DeleteActFinalTrackByIdRequest>
{
    private readonly ActFinalTrackService _finalTrackService;

    public DeleteActFinalTrackById(ActFinalTrackService finalTrackService)
    {
        _finalTrackService = finalTrackService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/final-tracks/{finalTrackId}");
    }

    public override async Task HandleAsync(DeleteActFinalTrackByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _finalTrackService.RemoveAsync(
            accountId.Value,
            new ActFinalTrackCommand { ActId = req.ActId, FinalTrackId = req.FinalTrackId },
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

public sealed record DeleteActFinalTrackByIdRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int FinalTrackId { get; init; }
}

public sealed class DeleteActFinalTrackByIdValidator : Validator<DeleteActFinalTrackByIdRequest>
{
    public DeleteActFinalTrackByIdValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.FinalTrackId).GreaterThan(0);
    }
}
