using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppAddOnMessages
{
    public const string VoteLead = "Abstimmen";
    public const string AnonymousVoteLead = "Anonym abstimmen";
    public const string SignUpLead = "Eintragen";
    public const string AttendanceLead = "Zu-/Absage";

    public const int NativePollMaxOptions = 12;
    public const int NativePollOptionLength = 100;

    private const string DeadlineLead = "Bis ";

    private static readonly IReadOnlyList<string> AttendanceAnswers =
    [
        .. WhatsAppAnswerRules.AttendanceOptions.Select(option => option.Label),
    ];

    [Pure]
    public static WhatsAppAddOnMessage AttendancePoll(string title, DateTimeOffset? answersUntil) =>
        new()
        {
            Operation = WhatsAppOperation.SendPoll,
            Text = QuestionOf(title, answersUntil),
            PollOptions = AttendanceAnswers,
            AllowsSeveralAnswers = false,
            AddOnKind = WhatsAppAddOnKind.Attendance,
            AddOnId = null,
        };

    [Pure]
    public static WhatsAppAddOnMessage AttendanceEvent(string title, WhatsAppPostSlot slot) =>
        new()
        {
            Operation = WhatsAppOperation.SendEvent,
            Text = title,
            EventSlot = slot,
            AddOnKind = WhatsAppAddOnKind.Attendance,
            AddOnId = null,
        };

    [Pure]
    public static WhatsAppAddOnMessage PollOf(Poll poll, string link) =>
        poll switch
        {
            { IsAnonymous: true } => LinkMessage(
                new WhatsAppAddOnLine(AnonymousVoteLead, poll.Question, poll.VotesUntil, link),
                WhatsAppBadge.Vote,
                WhatsAppAddOnKind.Poll,
                poll.Id
            ),
            _ when !FitsANativePoll(poll) => LinkMessage(
                new WhatsAppAddOnLine(VoteLead, poll.Question, poll.VotesUntil, link),
                WhatsAppBadge.Vote,
                WhatsAppAddOnKind.Poll,
                poll.Id
            ),
            _ => NativePollOf(poll),
        };

    [Pure]
    private static bool FitsANativePoll(Poll poll) =>
        poll.Options.Count <= NativePollMaxOptions
        && poll.Options.All(option => option.Label.Length <= NativePollOptionLength);

    [Pure]
    private static WhatsAppAddOnMessage NativePollOf(Poll poll)
    {
        var options = poll.Options.OrderBy(option => option.Position).ToList();
        return new()
        {
            Operation = WhatsAppOperation.SendPoll,
            Text = QuestionOf(poll.Question, poll.VotesUntil),
            PollOptions = [.. options.Select(option => option.Label)],
            PollOptionIds = [.. options.Select(option => option.Id)],
            AllowsSeveralAnswers = poll.AllowsMultipleChoices,
            AddOnKind = WhatsAppAddOnKind.Poll,
            AddOnId = poll.Id,
        };
    }

    [Pure]
    public static WhatsAppAddOnMessage SignUpListOf(SignUpList list, string link) =>
        LinkMessage(
            new WhatsAppAddOnLine(SignUpLead, list.Title, list.SignUpUntil, link),
            WhatsAppBadge.SignUpList,
            WhatsAppAddOnKind.SignUpList,
            list.Id
        );

    [Pure]
    public static string LineOf(WhatsAppAddOnLine line)
    {
        string?[] lines =
        [
            $"{line.Lead}: {WhatsAppFormatting.Bold(line.Name)}",
            line.Until is { } until ? DeadlineLead + WhatsAppPostText.DeadlineOf(until) : null,
            WhatsAppBadges.LinkLineOf(line.Link),
        ];
        return string.Join('\n', lines.OfType<string>());
    }

    [Pure]
    private static string QuestionOf(string question, DateTimeOffset? until) =>
        until is { } deadline
            ? $"{question} (bis {WhatsAppPostText.DeadlineOf(deadline)})"
            : question;

    [Pure]
    private static WhatsAppAddOnMessage LinkMessage(
        WhatsAppAddOnLine line,
        WhatsAppBadge badge,
        WhatsAppAddOnKind kind,
        int addOnId
    ) =>
        new()
        {
            Operation = WhatsAppOperation.PostText,
            Text = WhatsAppBadges.Headed(badge, LineOf(line)),
            AddOnKind = kind,
            AddOnId = addOnId,
        };
}
