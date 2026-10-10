namespace Furria.Core.News;

public sealed record NewsTextReading(string? Refusal, IReadOnlyList<NewsMention> Mentions);
