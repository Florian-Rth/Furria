namespace Furria.Application.Registry;

public sealed record MemberGroup
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required DateOnly Since { get; init; }
}
