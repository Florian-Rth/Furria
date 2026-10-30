using System.Diagnostics.Contracts;
using FastEndpoints;
using Furria.Core.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed record ChoreographyOverlapDto
{
    public required int SpotId { get; init; }

    public required IReadOnlyList<ChoreographyOverlapKeyframeDto> Keyframes { get; init; }
}

public sealed record ChoreographyOverlapKeyframeDto
{
    public required int SourceMediaItemId { get; init; }

    public required double Seconds { get; init; }
}

public sealed record ChoreographyOverlapConflictDto
{
    public required int StatusCode { get; init; }

    public required string Message { get; init; }

    public required IReadOnlyDictionary<string, IReadOnlyList<string>> Errors { get; init; }

    public required IReadOnlyList<ChoreographyOverlapDto> Overlaps { get; init; }
}

public static class ChoreographyOverlapConflict
{
    public const string OverlapMessage =
        "Jemand hat dieselben Plätze inzwischen anders aufgestellt. Entscheide, welche Fassung gilt.";

    private const string ConflictField = "conflict";
    private const string Summary = "One or more errors occurred!";

    public static Task SendAsync(
        HttpResponse response,
        IReadOnlyList<ChoreographyOverlap> overlaps,
        CancellationToken ct
    ) => response.SendAsync(ConflictOf(overlaps), StatusCodes.Status409Conflict, cancellation: ct);

    [Pure]
    private static ChoreographyOverlapConflictDto ConflictOf(
        IReadOnlyList<ChoreographyOverlap> overlaps
    ) =>
        new()
        {
            StatusCode = StatusCodes.Status409Conflict,
            Message = Summary,
            Errors = new Dictionary<string, IReadOnlyList<string>>
            {
                [ConflictField] = [OverlapMessage],
            },
            Overlaps =
            [
                .. overlaps.Select(overlap => new ChoreographyOverlapDto
                {
                    SpotId = overlap.SpotId,
                    Keyframes =
                    [
                        .. overlap.Keyframes.Select(anchor => new ChoreographyOverlapKeyframeDto
                        {
                            SourceMediaItemId = anchor.SourceMediaItemId,
                            Seconds = anchor.Seconds,
                        }),
                    ],
                }),
            ],
        };
}
