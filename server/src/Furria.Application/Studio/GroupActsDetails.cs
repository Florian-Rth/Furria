namespace Furria.Application.Studio;

public sealed record GroupActsDetails
{
    public required int RelevantSessionYear { get; init; }

    public required IReadOnlyList<GroupActSummary> Acts { get; init; }
}
