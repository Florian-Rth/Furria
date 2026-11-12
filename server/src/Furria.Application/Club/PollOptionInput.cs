namespace Furria.Application.Club;

public sealed record PollOptionInput
{
    public required int? OptionId { get; init; }

    public required string Label { get; init; }
}
