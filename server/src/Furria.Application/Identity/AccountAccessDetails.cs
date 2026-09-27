using Furria.Core.Identity;

namespace Furria.Application.Identity;

public sealed record AccountAccessDetails
{
    public required AccountAccessState State { get; init; }

    public required AccountIneligibilityReason? Reason { get; init; }

    public required LiveInvitationDetails? Invitation { get; init; }

    public required IReadOnlyList<AccountEventDetails> History { get; init; }
}
