namespace Furria.Application.Intakes;

public sealed record IntakeSubmission
{
    public static IntakeSubmission Received { get; } = new() { InvitationLink = null };

    public required string? InvitationLink { get; init; }
}
