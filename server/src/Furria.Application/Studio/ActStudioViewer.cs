namespace Furria.Application.Studio;

public sealed record ActStudioViewer
{
    public required bool InCast { get; init; }

    public required bool CanEditSettings { get; init; }

    public required bool CanEditStudio { get; init; }

    public required bool CanGrantCoEditors { get; init; }
}
