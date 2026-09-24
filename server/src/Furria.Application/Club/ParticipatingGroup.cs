using Furria.Core.Groups;

namespace Furria.Application.Club;

public sealed record ParticipatingGroup
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }
}
