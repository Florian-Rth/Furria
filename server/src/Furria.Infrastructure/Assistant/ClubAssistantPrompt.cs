using System.Diagnostics.Contracts;
using Furria.Core.Assistant;
using Microsoft.Extensions.AI;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantPrompt
{
    private const string NoGroups = "keine";

    private const string Rules = """
        Du bist der Vereinsassistent eines Karnevalsvereins und antwortest Mitgliedern im
        privaten WhatsApp-Chat.

        So antwortest du:
        - Deutsch, du-Form, kurz: 1 bis 4 Zeilen.
        - Fakten zuerst und exakt: Daten, Uhrzeiten und Orte genau so, wie die Werkzeuge sie
          liefern. Daten und Uhrzeiten *fett*. Wochentag zum Datum dazu.
        - Reichlich Karnevalshumor, aber nie auf Kosten der Fakten.
        - Du weißt nur, was die Werkzeuge liefern. Steht etwas nicht darin, sag ehrlich, dass du
          es nicht weißt. Kein Allgemeinwissen, kein Raten, nichts erfinden.
        - Nenne nie andere Personen.
        - Den Ablauf einer Veranstaltung nennst du nur als Nummern (*Nr. 5*), nie mit Uhrzeiten.
          Ist er noch nicht bestätigt, sag dazu, dass er sich noch ändern kann.
        - Du kannst nichts ändern, buchen oder eintragen. Wo jemand handeln will, gib den Link
          zum Eintrag in der App.
        - WhatsApp-Formatierung: *fett*, _kursiv_. Keine Überschriften, keine Tabellen, Links als
          nackte URL.
        - Alle Zeiten sind Vereinszeit (Europe/Berlin). „Heute", „morgen" und „Samstag" rechnest
          du vom jetzigen Datum aus.
        """;

    [Pure]
    public static IList<ChatMessage> MessagesFor(
        ClubAssistantAsker asker,
        ClubMomentFact now,
        string appUrl,
        IReadOnlyList<ClubAssistantTurn> history,
        string question
    ) =>
        [
            new(ChatRole.System, SystemTextFor(asker, now, appUrl)),
            .. history.Select(MessageOf),
            new(ChatRole.User, question),
        ];

    [Pure]
    private static string SystemTextFor(
        ClubAssistantAsker asker,
        ClubMomentFact now,
        string appUrl
    ) =>
        Rules
        + $"""


            Jetzt: {now.Weekday}, {now.Date}, {now.Time} Uhr.
            Du schreibst mit {asker.FirstName} (Gruppen: {GroupsOf(asker)}).
            App: {appUrl}
            """;

    [Pure]
    private static string GroupsOf(ClubAssistantAsker asker) =>
        asker.GroupNames.Count == 0 ? NoGroups : string.Join(", ", asker.GroupNames);

    [Pure]
    private static ChatMessage MessageOf(ClubAssistantTurn turn) =>
        new(
            turn.Speaker == ClubAssistantSpeaker.Asker ? ChatRole.User : ChatRole.Assistant,
            turn.Text
        );
}
