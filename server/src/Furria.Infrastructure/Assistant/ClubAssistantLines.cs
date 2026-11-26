using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Core.Assistant;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantLines
{
    public const string UnknownSender =
        "Ich kann nur Vereinsmitgliedern antworten, deren Handynummer in Furria hinterlegt ist.";

    public const string Disclosure =
        "Kurz vorweg: Ich bin der KI-Assistent des Vereins. 🤖 Ich antworte aus den Daten der "
        + "Vereins-App – und auch eine Narrenkappe kann sich mal irren.";

    private const string NotText =
        "Sprachnachrichten, Bilder und Sticker kann ich nicht lesen – ich bin ein reiner "
        + "Schriftgelehrter. ✍️ Tipp mir deine Frage einfach.";

    private const string DailyLimitReached =
        "Für heute sind deine Fragen aufgebraucht – ich schunkel mich erst mal aus. 🤡 "
        + "Morgen gern wieder!";

    [Pure]
    public static string Of(ClubAssistantNoticeKind kind, string appUrl, DateOnly today) =>
        kind switch
        {
            ClubAssistantNoticeKind.UnknownSender => UnknownSender,
            ClubAssistantNoticeKind.SwitchedOff => SwitchedOff(appUrl),
            ClubAssistantNoticeKind.NotText => NotText,
            ClubAssistantNoticeKind.DailyLimitReached => DailyLimitReached,
            ClubAssistantNoticeKind.BudgetUsedUp => BudgetUsedUp(appUrl, today),
            _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
        };

    [Pure]
    public static string ProviderFailed(string appUrl) =>
        "Huch, mir ist gerade die Pappnase verrutscht. 🤡 Ich komme nicht an meine Unterlagen – "
        + $"frag mich bitte später nochmal oder schau in die App: {appUrl}";

    [Pure]
    public static string Introduced(string answer) => $"{Disclosure}\n\n{answer}";

    [Pure]
    public static string AnswerFor(string reply, bool isIntroduced) =>
        ClubAssistantConversation.CappedAnswer(
            isIntroduced
                ? ClubAssistantWhatsAppText.Of(reply)
                : Introduced(ClubAssistantWhatsAppText.Of(reply))
        );

    [Pure]
    private static string SwitchedOff(string appUrl) =>
        "Der Vereinsassistent macht gerade Pause – die Narrenkappe hängt am Haken. 🎭 "
        + $"Alles Wichtige steht in der App: {appUrl}";

    [Pure]
    private static string BudgetUsedUp(string appUrl, DateOnly today) =>
        "Für diesen Monat ist mein Fass leer. 🍺 Ab dem "
        + WhatsAppFormatting.Bold(FirstOfNextMonth(today))
        + $" bin ich wieder für dich da – bis dahin steht alles in der App: {appUrl}";

    [Pure]
    private static string FirstOfNextMonth(DateOnly today) =>
        new DateOnly(today.Year, today.Month, 1)
            .AddMonths(1)
            .ToString("d.M.", CultureInfo.InvariantCulture);
}
