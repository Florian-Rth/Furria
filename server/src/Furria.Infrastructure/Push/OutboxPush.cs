using Furria.Infrastructure.Identity;

namespace Furria.Infrastructure.Push;

public sealed class OutboxPush
{
    public const int TitleLength = 160;
    public const int BodyLength = 300;
    public const int UrlLength = 200;
    public const int TagLength = 64;

    public long Id { get; set; }

    public int AccountId { get; set; }

    public string Title { get; set; } = "";

    public string Body { get; set; } = "";

    public string Url { get; set; } = "";

    public string Tag { get; set; } = "";

    public DateTimeOffset ExpiresAt { get; set; }

    public int Attempt { get; set; } = 1;

    public DateTimeOffset? NextAttemptAt { get; set; }

    public Account? Account { get; set; }
}
