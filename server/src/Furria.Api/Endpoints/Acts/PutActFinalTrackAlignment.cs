using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActFinalTrackAlignment : Endpoint<PutActFinalTrackAlignmentRequest>
{
    private readonly ActFinalTrackService _finalTrackService;

    public PutActFinalTrackAlignment(ActFinalTrackService finalTrackService)
    {
        _finalTrackService = finalTrackService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/final-tracks/{finalTrackId}/alignments/{sourceMediaItemId}");
    }

    public override async Task HandleAsync(
        PutActFinalTrackAlignmentRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _finalTrackService.SetOffsetAsync(
            accountId.Value,
            new ActFinalTrackOffsetCommand
            {
                ActId = req.ActId,
                FinalTrackId = req.FinalTrackId,
                SourceMediaItemId = req.SourceMediaItemId,
                OffsetSeconds = req.OffsetSeconds,
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

public sealed record PutActFinalTrackAlignmentRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int FinalTrackId { get; init; }

    [RouteParam]
    public required int SourceMediaItemId { get; init; }

    public required double OffsetSeconds { get; init; }
}

public sealed class PutActFinalTrackAlignmentValidator : Validator<PutActFinalTrackAlignmentRequest>
{
    public PutActFinalTrackAlignmentValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.FinalTrackId).GreaterThan(0);
        RuleFor(request => request.SourceMediaItemId).GreaterThan(0);
        RuleFor(request => request.OffsetSeconds).Must(double.IsFinite);
    }
}
