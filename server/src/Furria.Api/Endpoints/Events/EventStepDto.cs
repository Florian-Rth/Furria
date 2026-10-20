using Furria.Core.Events;

namespace Furria.Api.Endpoints.Events;

public sealed record EventStepDto
{
    public required EventStep Step { get; init; }

    public required EventStepState State { get; init; }

    public required DateOnly DueOn { get; init; }

    public required DateOnly? OpensOn { get; init; }

    public static EventStepDto From(EventStepStatus status) =>
        new()
        {
            Step = status.Step,
            State = status.State,
            DueOn = status.DueOn,
            OpensOn = status.OpensOn,
        };
}
