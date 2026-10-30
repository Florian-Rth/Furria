using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActFinalTrack : Endpoint<PutActFinalTrackRequest>
{
    private readonly ActFinalTrackService _finalTrackService;

    public PutActFinalTrack(ActFinalTrackService finalTrackService)
    {
        _finalTrackService = finalTrackService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/final-tracks/{finalTrackId}");
    }

    public override async Task HandleAsync(PutActFinalTrackRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _finalTrackService.SetBeatGridAsync(
            accountId.Value,
            new ActFinalTrackBeatCommand
            {
                ActId = req.ActId,
                FinalTrackId = req.FinalTrackId,
                FirstBeatSeconds = req.FirstBeatSeconds,
                TempoBpm = req.TempoBpm,
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

public sealed record PutActFinalTrackRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int FinalTrackId { get; init; }

    public required double? FirstBeatSeconds { get; init; }

    public required double? TempoBpm { get; init; }
}

public sealed class PutActFinalTrackValidator : Validator<PutActFinalTrackRequest>
{
    private const double SlowestTempoBpm = 40;
    private const double FastestTempoBpm = 300;

    public PutActFinalTrackValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.FinalTrackId).GreaterThan(0);
        RuleFor(request => request.FirstBeatSeconds).GreaterThanOrEqualTo(0);
        RuleFor(request => request.TempoBpm).InclusiveBetween(SlowestTempoBpm, FastestTempoBpm);
    }
}
