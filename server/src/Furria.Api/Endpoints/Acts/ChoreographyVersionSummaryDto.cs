using System.Diagnostics.Contracts;
using Furria.Application.Studio;
using Furria.Core.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed record ChoreographyVersionSummaryDto
{
    public required int Version { get; init; }

    public required ChoreographyVersionKind Kind { get; init; }

    public required int? RestoredFromVersion { get; init; }

    public required DateTimeOffset SavedAt { get; init; }

    public required ActPersonDto? SavedBy { get; init; }

    [Pure]
    public static ChoreographyVersionSummaryDto From(ChoreographyVersionSummary version) =>
        new()
        {
            Version = version.Version,
            Kind = version.Kind,
            RestoredFromVersion = version.RestoredFromVersion,
            SavedAt = version.SavedAt,
            SavedBy = version.SavedBy is { } person ? ActPersonDto.From(person) : null,
        };
}
