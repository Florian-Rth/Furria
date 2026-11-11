namespace Furria.Application.Start;

public sealed record StartPollOption
{
    public required int OptionId { get; init; }

    public required string Label { get; init; }

    public required bool ViewerChose { get; init; }
}
