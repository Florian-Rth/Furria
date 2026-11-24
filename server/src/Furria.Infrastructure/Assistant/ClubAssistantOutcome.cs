namespace Furria.Infrastructure.Assistant;

public sealed record ClubAssistantOutcome(ClubAssistantOutcomeKind Kind, string Text)
{
    public static readonly ClubAssistantOutcome BudgetUsedUp = new(
        ClubAssistantOutcomeKind.BudgetUsedUp,
        ""
    );

    public static readonly ClubAssistantOutcome ProviderFailed = new(
        ClubAssistantOutcomeKind.ProviderFailed,
        ""
    );

    public static ClubAssistantOutcome Answered(string text) =>
        new(ClubAssistantOutcomeKind.Answered, text);
}
