namespace Furria.Infrastructure.Assistant;

public sealed record DayScheduleFact(string? Title, IReadOnlyList<DayScheduleStepFact> Steps);
