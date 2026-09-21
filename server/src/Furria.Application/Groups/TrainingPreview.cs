namespace Furria.Application.Groups;

public sealed record TrainingPreview
{
    public required DateOnly DefaultEndsOn { get; init; }

    public required DateOnly EndsOn { get; init; }

    public required IReadOnlyList<TrainingPreviewRow> Rows { get; init; }
}
