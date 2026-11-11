namespace Furria.Application.Management;

public sealed record ManageHubGroupMatcher
{
    public required int ApprovedCount { get; init; }

    public required int WaitingProposalCount { get; init; }
}
