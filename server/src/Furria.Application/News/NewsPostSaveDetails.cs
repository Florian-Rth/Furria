namespace Furria.Application.News;

public sealed record NewsPostSaveDetails
{
    public required int Revision { get; init; }

    public required NewsSaveInBetween? SavedInBetween { get; init; }
}
