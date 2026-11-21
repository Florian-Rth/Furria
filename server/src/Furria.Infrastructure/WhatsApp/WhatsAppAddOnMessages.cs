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

    private static readonly IReadOnlyList<string> AttendanceAnswers =
    [
        .. WhatsAppAnswerRules.AttendanceOptions.Select(option => option.Label),
    ];

    [Pure]
    public static WhatsAppAddOnMessage AttendancePoll(string title) =>
        new()
        {
            Operation = WhatsAppOperation.SendPoll,
            Text = title,
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
                new WhatsAppAddOnLine(AnonymousVoteLead, poll.Question, link),
                WhatsAppAddOnKind.Poll,
                poll.Id
            ),
            _ when !FitsANativePoll(poll) => LinkMessage(
                new WhatsAppAddOnLine(VoteLead, poll.Question, link),
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
            Text = poll.Question,
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
            new WhatsAppAddOnLine(SignUpLead, list.Title, link),
            WhatsAppAddOnKind.SignUpList,
            list.Id
        );

    [Pure]
    public static string LineOf(WhatsAppAddOnLine line) =>
        $"{line.Lead}: {WhatsAppFormatting.Bold(line.Name)}\n{line.Link}";

    [Pure]
    private static WhatsAppAddOnMessage LinkMessage(
        WhatsAppAddOnLine line,
        WhatsAppAddOnKind kind,
        int addOnId
    ) =>
        new()
        {
            Operation = WhatsAppOperation.PostText,
            Text = LineOf(line),
            AddOnKind = kind,
            AddOnId = addOnId,
        };
}
