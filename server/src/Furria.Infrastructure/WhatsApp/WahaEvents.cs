namespace Furria.Infrastructure.WhatsApp;

public static class WahaEvents
{
    public const string SessionStatus = "session.status";
    public const string PollVote = "poll.vote";
    public const string PollVoteFailed = "poll.vote.failed";
    public const string EventResponse = "event.response";
    public const string GroupParticipants = "group.v2.participants";
    public const string Message = "message";
}
