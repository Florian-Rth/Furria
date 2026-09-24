namespace Furria.Application.Groups;

public sealed record SetGroupTrainingSlotsCommand
{
    public required int GroupId { get; init; }

    public required IReadOnlyList<GroupTrainingSlotInput> Slots { get; init; }
}
