namespace Furria.Application.Groups;

public sealed record TrainingPreviewQuery
{
    public required int GroupId { get; init; }

    public required int ViewerPersonId { get; init; }

    public required DateOnly? EndsOn { get; init; }
}
