using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Core.Studio;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetActSeason : Endpoint<GetActSeasonRequest, GetActSeasonResponse>
{
    private readonly ActSeasonReader _seasonReader;

    public GetActSeason(ActSeasonReader seasonReader)
    {
        _seasonReader = seasonReader;
    }

    public override void Configure()
    {
        Get("acts/season");
        Definition.RequireAnyPermission(RunningOrderKeys.Planners);
    }

    public override async Task HandleAsync(GetActSeasonRequest req, CancellationToken ct)
    {
        var season = await _seasonReader.GetSeasonAsync(req.Session, ct);

        await Send.OkAsync(
            new GetActSeasonResponse
            {
                SessionYear = season.SessionYear,
                SessionYears = season.SessionYears,
                Evenings = [.. season.Evenings.Select(ToDto)],
                Acts = [.. season.Acts.Select(ToDto)],
            },
            cancellation: ct
        );
    }

    [Pure]
    private static SeasonEveningDto ToDto(SeasonEveningSummary evening) =>
        new()
        {
            EventId = evening.EventId,
            Title = evening.Title,
            StartsAt = evening.StartsAt,
            HasRunningOrder = evening.HasRunningOrder,
            Confirmed = evening.IsConfirmed,
        };

    [Pure]
    private static SeasonActDto ToDto(SeasonActSummary act) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            Group = ActGroupDto.From(act.Group),
            CastCount = act.CastCount,
            Readiness =
            [
                .. act.Readiness.Select(check => new SeasonReadinessDto
                {
                    Check = check.Check,
                    Done = check.IsDone,
                }),
            ],
            Appearances = [.. act.Appearances.Select(ToDto)],
        };

    [Pure]
    private static SeasonAppearanceDto ToDto(SeasonAppearanceSummary appearance) =>
        new()
        {
            AppearanceId = appearance.AppearanceId,
            EventId = appearance.EventId,
            Position = appearance.Position,
            Changes = appearance.Changes,
            Added = [.. appearance.Added.Select(CastPersonDto.From)],
            Removed = [.. appearance.Removed.Select(CastPersonDto.From)],
        };
}

public sealed record GetActSeasonRequest
{
    [QueryParam]
    public int? Session { get; init; }
}

public sealed class GetActSeasonValidator : Validator<GetActSeasonRequest>
{
    public GetActSeasonValidator()
    {
        RuleFor(request => request.Session).GreaterThanOrEqualTo(ClubSession.EarliestSessionYear);
    }
}

public sealed record GetActSeasonResponse
{
    public required int SessionYear { get; init; }

    public required IReadOnlyList<int> SessionYears { get; init; }

    public required IReadOnlyList<SeasonEveningDto> Evenings { get; init; }

    public required IReadOnlyList<SeasonActDto> Acts { get; init; }
}

public sealed record SeasonEveningDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required bool HasRunningOrder { get; init; }

    public required bool Confirmed { get; init; }
}

public sealed record SeasonActDto
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required ActGroupDto? Group { get; init; }

    public required int CastCount { get; init; }

    public required IReadOnlyList<SeasonReadinessDto> Readiness { get; init; }

    public required IReadOnlyList<SeasonAppearanceDto> Appearances { get; init; }
}

public sealed record SeasonReadinessDto
{
    public required ReadinessCheck Check { get; init; }

    public required bool Done { get; init; }
}

public sealed record SeasonAppearanceDto
{
    public required int AppearanceId { get; init; }

    public required int EventId { get; init; }

    public required int? Position { get; init; }

    public required IReadOnlyList<EveningChange> Changes { get; init; }

    public required IReadOnlyList<CastPersonDto> Added { get; init; }

    public required IReadOnlyList<CastPersonDto> Removed { get; init; }
}
