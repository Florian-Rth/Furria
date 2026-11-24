namespace Furria.Core.Assistant;

public sealed class ClubAssistantSettings
{
    public const int TheOnlyId = 1;
    public const int BudgetPrecision = 8;
    public const int BudgetScale = 2;
    public const decimal DefaultMonthlyBudgetEuros = 10m;
    public const decimal LargestMonthlyBudgetEuros = 1000m;
    public const int DefaultQuestionsPerPersonPerDay = 30;
    public const int MostQuestionsPerPersonPerDay = 500;

    public int Id { get; set; } = TheOnlyId;

    public bool IsEnabled { get; set; }

    public decimal MonthlyBudgetEuros { get; set; } = DefaultMonthlyBudgetEuros;

    public int QuestionsPerPersonPerDay { get; set; } = DefaultQuestionsPerPersonPerDay;
}
