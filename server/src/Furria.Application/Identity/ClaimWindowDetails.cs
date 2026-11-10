namespace Furria.Application.Identity;

public sealed record ClaimWindowDetails
{
    public required DateTimeOffset OpenedAt { get; init; }

    public required DateTimeOffset ClosesAt { get; init; }
}
