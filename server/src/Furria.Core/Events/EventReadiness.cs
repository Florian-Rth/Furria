namespace Furria.Core.Events;

public sealed record EventReadiness(IReadOnlyList<EventStepStatus> Steps, EventStep? CurrentStep);
