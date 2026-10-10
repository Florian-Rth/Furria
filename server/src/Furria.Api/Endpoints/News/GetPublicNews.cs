using FastEndpoints;
using Furria.Api.Media;
using Furria.Application.News;
using Furria.Core.News;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class GetPublicNews : EndpointWithoutRequest<GetPublicNewsResponse>
{
    private readonly NewsService _newsService;

    public GetPublicNews(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Get("public/news");
        AllowAnonymous();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var sections = await _newsService.GetPublicNewsAsync(ct);

        await Send.OkAsync(
            new GetPublicNewsResponse { Sessions = [.. sections.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static PublicNewsSessionDto ToDto(PublicNewsSection section) =>
        new()
        {
            SessionStartYear = section.SessionStartYear,
            SessionNumber = section.SessionNumber,
            Posts = [.. section.Posts.Select(ToDto)],
        };

    private static PublicNewsPostSummaryDto ToDto(PublicNewsSummary post) =>
        new()
        {
            Slug = post.Slug,
            Title = post.Title,
            Teaser = post.Teaser,
            Text = post.Text,
            Category = post.Category,
            PublishedAt = post.PublishedAt,
            Picture = PictureDto.From(post.Picture),
        };
}

public sealed record GetPublicNewsResponse
{
    public required IReadOnlyList<PublicNewsSessionDto> Sessions { get; init; }
}

public sealed record PublicNewsSessionDto
{
    public required int SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<PublicNewsPostSummaryDto> Posts { get; init; }
}

public sealed record PublicNewsPostSummaryDto
{
    public required string Slug { get; init; }

    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required string Text { get; init; }

    public required NewsCategory Category { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required PictureDto? Picture { get; init; }
}
