using Furria.Core.Identity;

namespace Furria.Core.Assistant;

public sealed class ClubAssistantQuestion
{
    public const int ChatIdLength = 128;
    public const int LongestText = 2000;
    public const int LongestAnswer = 4000;

    public long Id { get; set; }

    public int PersonId { get; set; }

    public string ChatId { get; set; } = "";

    public string Text { get; set; } = "";

    public DateTimeOffset AskedAt { get; set; }

    public DateTimeOffset LastMessageAt { get; set; }

    public string? Answer { get; set; }

    public DateTimeOffset? AnsweredAt { get; set; }

    public Person? Person { get; set; }
}
