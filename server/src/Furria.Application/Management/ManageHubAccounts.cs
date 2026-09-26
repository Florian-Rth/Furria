namespace Furria.Application.Management;

public sealed record ManageHubAccounts
{
    public required int WithAccessCount { get; init; }

    public required int OfCount { get; init; }

    public required int OpenInvitationCount { get; init; }

    public required int EligibleWithoutEmailCount { get; init; }
}
