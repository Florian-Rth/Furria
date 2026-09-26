namespace Furria.Application.Identity;

public sealed record InvitationRoundPreviewDetails
{
    public required int InviteCount { get; init; }

    public required int RemindCount { get; init; }

    public required int EligibleWithoutEmailCount { get; init; }
}
