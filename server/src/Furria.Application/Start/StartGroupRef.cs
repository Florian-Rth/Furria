using Furria.Core.Groups;

namespace Furria.Application.Start;

public sealed record StartGroupRef
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }
}
