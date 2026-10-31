using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActFinalTrackAlignment
    : Endpoint<PostActFinalTrackAlignmentRequest, PostActFinalTrackAlignmentResponse>
{
    private readonly ActFinalTrackService _finalTrackService;

    public PostActFinalTrackAlignment(ActFinalTrackService finalTrackService)
    {
        _finalTrackService = finalTrackService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/final-tracks/{finalTrackId}/alignment");
    }

    public override async Task HandleAsync(
        PostActFinalTrackAlignmentRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _finalTrackService.MatchAsync(
            accountId.Value,
            new ActFinalTrackCommand { ActId = req.ActId, FinalTrackId = req.FinalTrackId },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostActFinalTrackAlignmentResponse
            {
                Matches =
                [
                    .. result.Value.Select(match => new FinalTrackMatchDto
                    {
                        SourceMediaItemId = match.SourceMediaItemId,
                        OffsetSeconds = match.OffsetSeconds,
                        Stretch = match.Stretch,
                        Confidence = match.Confidence,
                    }),
                ],
            },
            cancellation: ct
        );
    }
}

public sealed record PostActFinalTrackAlignmentRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int FinalTrackId { get; init; }
}

public sealed class PostActFinalTrackAlignmentValidator
    : Validator<PostActFinalTrackAlignmentRequest>
{
    public PostActFinalTrackAlignmentValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.FinalTrackId).GreaterThan(0);
    }
}

public sealed record PostActFinalTrackAlignmentResponse
{
    public required IReadOnlyList<FinalTrackMatchDto> Matches { get; init; }
}

public sealed record FinalTrackMatchDto
{
    public required int SourceMediaItemId { get; init; }

    public required double OffsetSeconds { get; init; }

    public required double Stretch { get; init; }

    public required double Confidence { get; init; }
}
