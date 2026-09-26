namespace Furria.Application.Identity;

public sealed record ChangePasswordCommand
{
    public required int AccountId { get; init; }

    public required string CurrentPassword { get; init; }

    public required string NewPassword { get; init; }
}
