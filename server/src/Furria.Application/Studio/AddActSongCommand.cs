namespace Furria.Application.Studio;

public sealed record AddActSongCommand
{
    public required int ActId { get; init; }

    public required int MediaItemId { get; init; }
}
