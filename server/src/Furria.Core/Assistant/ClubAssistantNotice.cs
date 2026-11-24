namespace Furria.Core.Assistant;

public sealed class ClubAssistantNotice
{
    public string ChatId { get; set; } = "";

    public ClubAssistantNoticeKind Kind { get; set; }

    public DateTimeOffset ToldAt { get; set; }
}
