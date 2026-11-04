namespace Furria.Application.Push;

public sealed record PushMessage
{
    public required string Title { get; init; }

    public required string Body { get; init; }

    public required string Url { get; init; }

    public required string Tag { get; init; }

    public required TimeSpan TimeToLive { get; init; }
}
