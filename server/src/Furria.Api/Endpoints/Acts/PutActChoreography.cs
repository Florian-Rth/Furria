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

        await Send.OkAsync(
            new PutActChoreographyResponse { Version = result.Value },
            cancellation: ct
        );
    }

    private static SaveChoreographyCommand ToCommand(PutActChoreographyRequest req) =>
        new()
        {
            ActId = req.ActId,
            ExpectedVersion = req.ExpectedVersion,
            Document = new ChoreographyDocument([
                .. req.Tracks.Select(track => new SpotTrack(
                    track.SpotId,
                    [.. track.Keyframes.Select(ToKeyframe)]
                )),
            ]),
        };

    private static Keyframe ToKeyframe(ChoreographyKeyframeDataDto keyframe) =>
        new(
            new MusicAnchor(keyframe.SourceMediaItemId, keyframe.Seconds),
            ToPoint(keyframe.Position),
            keyframe.Bend is { } bend ? ToPoint(bend) : null,
            keyframe.Easing,
            keyframe.FacingDegrees
        );

    private static StagePoint ToPoint(ChoreographyPointDataDto point) =>
        new(point.RightMetres, point.BackMetres);
}

public sealed record PutActChoreographyRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required int? ExpectedVersion { get; init; }

    public required IReadOnlyList<ChoreographyTrackDataDto> Tracks { get; init; }
}

public sealed record ChoreographyTrackDataDto
{
    public required int SpotId { get; init; }

    public required IReadOnlyList<ChoreographyKeyframeDataDto> Keyframes { get; init; }
}

public sealed record ChoreographyKeyframeDataDto
{
    public required int SourceMediaItemId { get; init; }

    public required double Seconds { get; init; }

    public required ChoreographyPointDataDto Position { get; init; }

    public required ChoreographyPointDataDto? Bend { get; init; }

    public required KeyframeEasing Easing { get; init; }

    public required double? FacingDegrees { get; init; }
}

public sealed record ChoreographyPointDataDto
{
    public required double RightMetres { get; init; }

    public required double BackMetres { get; init; }
}

public sealed class PutActChoreographyValidator : Validator<PutActChoreographyRequest>
{
    private const int MostKeyframesPerTrack = 2000;

    public PutActChoreographyValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.ExpectedVersion).GreaterThanOrEqualTo(Choreography.FirstVersion);
        RuleFor(request => request.Tracks)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(tracks => tracks.Count <= Spot.MostPerAct);
        RuleForEach(request => request.Tracks)
            .ChildRules(track =>
            {
                track.RuleFor(row => row.SpotId).GreaterThan(0);
                track
                    .RuleFor(row => row.Keyframes)
                    .Cascade(CascadeMode.Stop)
                    .NotNull()
                    .Must(keyframes => keyframes.Count <= MostKeyframesPerTrack);
                track.RuleForEach(row => row.Keyframes).ChildRules(KeyframeRules);
            });
    }

    private static void KeyframeRules(InlineValidator<ChoreographyKeyframeDataDto> keyframe)
    {
        keyframe.RuleFor(row => row.SourceMediaItemId).GreaterThan(0);
        keyframe.RuleFor(row => row.Seconds).GreaterThanOrEqualTo(0).Must(double.IsFinite);
        keyframe.RuleFor(row => row.Position).NotNull();
        keyframe.RuleFor(row => row.Easing).IsInEnum();
        keyframe
            .RuleFor(row => row.FacingDegrees)
            .Must(facing => facing is not { } degrees || double.IsFinite(degrees));
    }
}

public sealed record PutActChoreographyResponse
{
    public required int Version { get; init; }
}
