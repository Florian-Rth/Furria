using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActChoreography
    : Endpoint<PutActChoreographyRequest, PutActChoreographyResponse>
{
    private readonly ActChoreographyService _choreographyService;

    public PutActChoreography(ActChoreographyService choreographyService)
    {
        _choreographyService = choreographyService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/choreography");
    }

    public override async Task HandleAsync(PutActChoreographyRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _choreographyService.SaveAsync(accountId.Value, ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        if (result.Value.Version is not { } version)
        {
            await ChoreographyOverlapConflict.SendAsync(
                HttpContext.Response,
                result.Value.Overlaps,
                ct
            );
            return;
        }

        await Send.OkAsync(new PutActChoreographyResponse { Version = version }, cancellation: ct);
    }

    private static SaveChoreographyCommand ToCommand(PutActChoreographyRequest req) =>
        new()
        {
            ActId = req.ActId,
            BaseVersion = req.BaseVersion,
            ChangedTracks = ChoreographyTrackDataDto.TracksOf(req.Tracks),
        };
}

public sealed record PutActChoreographyRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required int? BaseVersion { get; init; }

    public required IReadOnlyList<ChoreographyTrackDataDto> Tracks { get; init; }
}

public sealed class PutActChoreographyValidator : Validator<PutActChoreographyRequest>
{
    public PutActChoreographyValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.BaseVersion).GreaterThanOrEqualTo(Choreography.FirstVersion);
        RuleFor(request => request.Tracks)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(tracks => tracks.Count <= Spot.MostPerAct)
            .Must(ChoreographyTrackDataValidator.TracksEverySpotOnce);
        RuleForEach(request => request.Tracks).SetValidator(new ChoreographyTrackDataValidator());
    }
}

public sealed record PutActChoreographyResponse
{
    public required int Version { get; init; }
}
