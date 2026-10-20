namespace Furria.Core.Events;

public sealed record EventStepStatus(
    EventStep Step,
    EventStepState State,
    DateOnly DueOn,
    DateOnly? OpensOn
);
