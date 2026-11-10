namespace Furria.Application.Club;

public sealed record CalendarPollOptionInput
{
    public required int? OptionId { get; init; }

    public required string Label { get; init; }
}
