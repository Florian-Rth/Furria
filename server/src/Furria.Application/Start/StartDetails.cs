namespace Furria.Application.Start;

public sealed record StartDetails
{
    public required DateTimeOffset AsOf { get; init; }

    public required DateOnly Today { get; init; }

    public required DateTimeOffset? ReshapeAt { get; init; }

    public required bool ViewerIsActiveInClub { get; init; }

    public required IReadOnlyList<StartPanel> Panels { get; init; }
}
