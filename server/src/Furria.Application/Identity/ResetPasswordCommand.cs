namespace Furria.Application.Identity;

public sealed record ResetPasswordCommand
{
    public required string Reset { get; init; }

    public required string Password { get; init; }
}
