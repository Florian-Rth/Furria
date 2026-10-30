namespace Furria.Application.Club;

public sealed record CalendarWindowQuery
{
    public required int ViewerAccountId { get; init; }

    public required bool ClubOwnedOnly { get; init; }

    public required int? OwnerGroupId { get; init; }

    public required DateOnly From { get; init; }

    public required DateOnly To { get; init; }
}
