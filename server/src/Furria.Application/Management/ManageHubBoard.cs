namespace Furria.Application.Management;

public sealed record ManageHubBoard
{
    public required int OfficeCount { get; init; }

    public required int SeatCount { get; init; }

    public required int VacantOfficeCount { get; init; }
}
