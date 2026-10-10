namespace Furria.Application.News;

public sealed record NewsPublication(string Slug, DateTimeOffset PublishedAt, int Revision);
