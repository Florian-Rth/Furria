namespace Furria.Application.Management;

public sealed record ManageHubIntakes
{
    public required int OpenCount { get; init; }

    public required int NeedsReviewCount { get; init; }
}
