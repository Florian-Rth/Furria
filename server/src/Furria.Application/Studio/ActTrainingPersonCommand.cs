namespace Furria.Application.Studio;

public sealed record ActTrainingPersonCommand
{
    public required int ActId { get; init; }

    public required int CalendarEntryId { get; init; }

    public required int PersonId { get; init; }
}
