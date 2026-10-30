namespace Furria.Infrastructure.Studio;

public sealed record StudioEditorship
{
    public required bool InCast { get; init; }

    public required bool IsCoEditor { get; init; }

    public required bool LeadsGroup { get; init; }

    public bool MayEditStudio => LeadsGroup || IsCoEditor;
}
