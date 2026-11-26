namespace Furria.Application.Assistant;

public sealed record UpdateClubAssistantCommand(
    bool IsEnabled,
    decimal MonthlyBudgetEuros,
    int QuestionsPerPersonPerDay
);
