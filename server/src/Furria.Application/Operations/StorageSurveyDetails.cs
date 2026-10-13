namespace Furria.Application.Operations;

public sealed record StorageSurveyDetails
{
    public required DateTimeOffset MeasuredAt { get; init; }

    public required int CadenceSeconds { get; init; }

    public required StorageTally Originals { get; init; }

    public required StorageTally Renditions { get; init; }

    public required StorageTally Staging { get; init; }
}
