namespace Furria.Application.Groups;

public sealed record TrainingInstant
{
    public required int GroupTrainingSlotId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }
}
