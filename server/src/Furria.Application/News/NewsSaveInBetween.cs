namespace Furria.Application.News;

public sealed record NewsSaveInBetween(NewsAuthor? SavedBy, DateTimeOffset SavedAt);
