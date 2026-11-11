namespace Furria.Application.Club;

public sealed record GroupCalendarQuery
{
    public required int ViewerAccountId { get; init; }

    public required int? ViewerPersonId { get; init; }

    public required int GroupId { get; init; }

    public required DateOnly From { get; init; }

    public required DateOnly To { get; init; }
}
