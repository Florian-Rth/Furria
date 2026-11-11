namespace Furria.Application.Club;

public sealed record CalendarPollVoter
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
