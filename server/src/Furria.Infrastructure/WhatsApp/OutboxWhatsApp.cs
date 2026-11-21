namespace Furria.Infrastructure.WhatsApp;

public sealed class OutboxWhatsApp
{
    public const int ErrorLength = 500;

    public long Id { get; set; }

    public string ChatId { get; set; } = "";

    public WhatsAppOperation Operation { get; set; }

    public WhatsAppHostKind HostKind { get; set; }

    public int HostId { get; set; }

    public string Text { get; set; } = "";

    public List<string> Mentions { get; set; } = [];

    public List<string> PollOptions { get; set; } = [];

    public List<int> PollOptionIds { get; set; } = [];

    public bool AllowsSeveralAnswers { get; set; }

    public DateTimeOffset? EventStartsAt { get; set; }

    public DateTimeOffset? EventEndsAt { get; set; }

    public string? EventPlace { get; set; }

    public WhatsAppAddOnKind? AddOnKind { get; set; }

    public int? AddOnId { get; set; }

    public string? TargetMessageId { get; set; }

    public DateTimeOffset EnqueuedAt { get; set; }

    public int Attempt { get; set; } = 1;

    public DateTimeOffset? NextAttemptAt { get; set; }

    public DateTimeOffset? FailedAt { get; set; }

    public string? LastError { get; set; }
}
