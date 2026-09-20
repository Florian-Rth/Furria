namespace Furria.Application.Management;

public sealed record ManageHubPersons
{
    public required int PersonCount { get; init; }

    public required int MemberCount { get; init; }
}
