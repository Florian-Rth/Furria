namespace Furria.Application.Groups;

public sealed record SetGroupUsualTrainingTimesCommand
{
    public required int GroupId { get; init; }

    public required IReadOnlyList<UsualTrainingTimeInput> UsualTrainingTimes { get; init; }
}
