namespace Furria.Application.Identity;

public sealed record PasskeyDetails
{
    public required string Id { get; init; }

    public required string Name { get; init; }

    public required DateTimeOffset AddedAt { get; init; }
}
