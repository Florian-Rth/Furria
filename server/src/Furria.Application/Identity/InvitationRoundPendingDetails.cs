namespace Furria.Application.Identity;

public sealed record InvitationRoundPendingDetails
{
    public required IReadOnlyList<int> InviteePersonIds { get; init; }

    public required IReadOnlyList<int> ReminderInvitationIds { get; init; }

    public required IReadOnlyList<int> EligibleWithoutEmailPersonIds { get; init; }
}
