namespace Furria.Core.Text;

public sealed record RichTextReading(string? Refusal, IReadOnlyList<Mention> Mentions);
