using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Media;
using Furria.Application.Authorization;
using Furria.Application.News;
using Furria.Core.News;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class GetNews : EndpointWithoutRequest<GetNewsResponse>
{
    private readonly NewsService _newsService;

    public GetNews(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Get("news");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var sections = await _newsService.GetHubAsync(ct);

        await Send.OkAsync(
            new GetNewsResponse { Sections = [.. sections.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static GetNewsSectionDto ToDto(NewsSection section) =>
        new()
        {
            SessionStartYear = section.SessionStartYear,
            SessionNumber = section.SessionNumber,
            Posts = [.. section.Posts.Select(ToDto)],
        };

    private static GetNewsPostDto ToDto(NewsPostSummary post) =>
        new()
        {
            NewsPostId = post.NewsPostId,
            Title = post.Title,
            Teaser = post.Teaser,
            Category = post.Category,
            State = post.State,
            HasPendingChanges = post.HasPendingChanges,
            Slug = post.Slug,
            PublishedAt = post.PublishedAt,
            WithdrawnAt = post.WithdrawnAt,
            PendingSavedAt = post.PendingSavedAt,
            Picture = PictureDto.From(post.Picture),
            Missing = post.Missing,
            UpdatedAt = post.UpdatedAt,
            Author = post.Author is { } author
                ? new GetNewsAuthorDto
                {
                    PersonId = author.PersonId,
                    FirstName = author.FirstName,
                    LastName = author.LastName,
                }
                : null,
        };
}

public sealed record GetNewsResponse
{
    public required IReadOnlyList<GetNewsSectionDto> Sections { get; init; }
}

public sealed record GetNewsSectionDto
{
    public required int? SessionStartYear { get; init; }

    public required int? SessionNumber { get; init; }

    public required IReadOnlyList<GetNewsPostDto> Posts { get; init; }
}

public sealed record GetNewsPostDto
{
    public required int NewsPostId { get; init; }

    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required NewsCategory? Category { get; init; }

    public required NewsPostState State { get; init; }

    public required bool HasPendingChanges { get; init; }

    public required string? Slug { get; init; }

    public required DateTimeOffset? PublishedAt { get; init; }

    public required DateTimeOffset? WithdrawnAt { get; init; }

    public required DateTimeOffset? PendingSavedAt { get; init; }

    public required PictureDto? Picture { get; init; }

    public required IReadOnlyList<NewsPublicationRequirement> Missing { get; init; }

    public required DateTimeOffset UpdatedAt { get; init; }

    public required GetNewsAuthorDto? Author { get; init; }
}

public sealed record GetNewsAuthorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
