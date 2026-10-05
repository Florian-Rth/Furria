using Furria.Core.Groups;

namespace Furria.Application.Start;

public sealed record StartGroupMoment
{
    public required StartGroupMomentKind Kind { get; init; }

    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }

    public required int Years { get; init; }

    public required int FoundedYear { get; init; }

    public required DateOnly Until { get; init; }
}
