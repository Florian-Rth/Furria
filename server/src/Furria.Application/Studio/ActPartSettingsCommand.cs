namespace Furria.Application.Studio;

public sealed record ActPartSettingsCommand
{
    public required int ActId { get; init; }

    public required int PartId { get; init; }

    public required string Name { get; init; }

    public required int FirstStepId { get; init; }

    public required int? MainVideoId { get; init; }
}
