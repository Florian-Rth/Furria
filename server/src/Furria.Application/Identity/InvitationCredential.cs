namespace Furria.Application.Identity;

public sealed record InvitationCredential
{
    public required string? Token { get; init; }

    public required string? Code { get; init; }
}
