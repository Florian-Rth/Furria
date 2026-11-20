namespace Furria.Infrastructure.WhatsApp;

public sealed record WahaOutgoingImage
{
    public required string ChatId { get; init; }

    public required string MimeType { get; init; }

    public required string FileName { get; init; }

    public required byte[] Content { get; init; }

    public required string Caption { get; init; }

    public string? ReplyTo { get; init; }

    public IReadOnlyList<string> Mentions { get; init; } = [];
}
