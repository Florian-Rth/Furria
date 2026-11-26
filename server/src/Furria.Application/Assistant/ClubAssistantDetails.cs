namespace Furria.Application.Assistant;

public sealed record ClubAssistantDetails(
    bool IsEnabled,
    decimal MonthlyBudgetEuros,
    int QuestionsPerPersonPerDay,
    decimal UsedThisMonthEuros,
    bool IsModelConfigured
);
