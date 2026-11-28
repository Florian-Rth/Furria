namespace Furria.Application.Club;

public sealed record WithdrawAttendanceMarkCommand
{
    public required int ActorAccountId { get; init; }

    public required int CalendarEntryId { get; init; }

    public required int PersonId { get; init; }
}
