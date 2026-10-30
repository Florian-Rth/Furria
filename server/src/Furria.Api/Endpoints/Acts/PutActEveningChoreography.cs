using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActEveningChoreography
    : Endpoint<PutActEveningChoreographyRequest, PutActEveningChoreographyResponse>
{
    private readonly ActEveningService _eveningService;

    public PutActEveningChoreography(ActEveningService eveningService)
    {
        _eveningService = eveningService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/evenings/{eventId}/choreography");
    }

    public override async Task HandleAsync(
        PutActEveningChoreographyRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _eveningService.SaveChoreographyAsync(
            accountId.Value,
            ToCommand(req),
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PutActEveningChoreographyResponse { Version = result.Value },
            cancellation: ct
        );
    }

    private static SaveEveningChoreographyCommand ToCommand(PutActEveningChoreographyRequest req) =>
        new()
        {
            Evening = new ActEveningCommand { ActId = req.ActId, EventId = req.EventId },
            ExpectedVersion = req.ExpectedVersion,
            SessionVersion = req.SessionVersion,
            Document = ChoreographyTrackDataDto.DocumentOf(req.Tracks),
        };
}

public sealed record PutActEveningChoreographyRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int EventId { get; init; }

    public required int? ExpectedVersion { get; init; }

    public required int? SessionVersion { get; init; }

    public required IReadOnlyList<ChoreographyTrackDataDto> Tracks { get; init; }
}

public sealed class PutActEveningChoreographyValidator : Validator<PutActEveningChoreographyRequest>
{
    public PutActEveningChoreographyValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.ExpectedVersion).GreaterThanOrEqualTo(Choreography.FirstVersion);
        RuleFor(request => request.SessionVersion).GreaterThanOrEqualTo(Choreography.FirstVersion);
        RuleFor(request => request.Tracks)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(tracks => tracks.Count <= Spot.MostPerAct);
        RuleForEach(request => request.Tracks).SetValidator(new ChoreographyTrackDataValidator());
    }
}

public sealed record PutActEveningChoreographyResponse
{
    public required int Version { get; init; }
}
