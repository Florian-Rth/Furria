namespace Furria.Application.Club;

public sealed record BoardOfficeDetails
{
    public required int BoardOfficeId { get; init; }

    public required string Name { get; init; }

    public required int SortOrder { get; init; }

    public required int? ImpliedRoleId { get; init; }

    public required string? ImpliedRoleName { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<BoardSeatHolder> Seats { get; init; }

    public required IReadOnlyList<BoardSeatHolder> PastSeats { get; init; }
}
