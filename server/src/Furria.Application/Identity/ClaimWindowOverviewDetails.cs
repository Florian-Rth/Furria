namespace Furria.Application.Identity;

public sealed record ClaimWindowOverviewDetails
{
    public required ClaimWindowDetails? Window { get; init; }

    public required IReadOnlyList<ClaimSummary> Claims { get; init; }
}
