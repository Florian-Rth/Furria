namespace Furria.Application.Identity;

public sealed record ChangeLoginEmailCommand
{
    public required int AccountId { get; init; }

    public required string LoginEmail { get; init; }

    public required bool UpdateContactEmail { get; init; }
}
