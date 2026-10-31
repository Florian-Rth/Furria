namespace Furria.Application.Studio;

public sealed record ActFinalTrackBeatCommand
{
    public required int ActId { get; init; }

    public required int FinalTrackId { get; init; }

    public required double? FirstBeatSeconds { get; init; }

    public required double? TempoBpm { get; init; }
}
