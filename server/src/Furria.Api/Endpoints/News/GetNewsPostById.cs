using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Media;
using Furria.Application.Authorization;
using Furria.Application.News;
using Furria.Core.News;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class GetNewsPostById : Endpoint<GetNewsPostByIdRequest, GetNewsPostByIdResponse>
{
    private readonly NewsService _newsService;

    public GetNewsPostById(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Get("news/{newsPostId}");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(GetNewsPostByIdRequest req, CancellationToken ct)
    {
        var details = await _newsService.GetAsync(req.NewsPostId, ct);
        if (details is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(details), cancellation: ct);
    }

    private static GetNewsPostByIdResponse ToResponse(NewsPostDetails details) =>
        new()
        {
            NewsPostId = details.NewsPostId,
            State = details.State,
            Slug = details.Slug,
            PublishedAt = details.PublishedAt,
            WithdrawnAt = details.WithdrawnAt,
            Author = ToDto(details.Author),
            LastSavedBy = ToDto(details.LastSavedBy),
            Revision = details.Revision,
            UpdatedAt = details.UpdatedAt,
            Content = ToDto(details.Content),
            PendingSavedAt = details.PendingSavedAt,
            PendingChanges = details.PendingChanges is { } pending ? ToDto(pending) : null,
        };

    private static NewsPostAuthorDto? ToDto(NewsAuthor? author) =>
        author is null
            ? null
            : new NewsPostAuthorDto
            {
                PersonId = author.PersonId,
                FirstName = author.FirstName,
                LastName = author.LastName,
            };

    private static NewsPostVersionDto ToDto(NewsPostVersion version) =>
        new()
        {
            Title = version.Title,
            Teaser = version.Teaser,
            Text = version.Text,
            Category = version.Category,
            Event = version.Event is { } tie
                ? new NewsPostEventDto
                {
                    EventId = tie.EventId,
                    Title = tie.Title,
                    StartsAt = tie.StartsAt,
                    EndsAt = tie.EndsAt,
                    VenueName = tie.VenueName,
                    IsCancelled = tie.IsCancelled,
                }
                : null,
            Album = version.Album is { } album
                ? new NewsPostAlbumDto
                {
                    AlbumId = album.AlbumId,
                    Title = album.Title,
                    IsPublished = album.IsPublished,
                    PhotoCount = album.PhotoCount,
                    Cover = PictureDto.From(album.Cover),
                }
                : null,
            Picture = PictureEditingDto.From(version.Picture),
            PictureCaption = version.PictureCaption,
        };
}

public sealed record GetNewsPostByIdRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }
}

public sealed class GetNewsPostByIdValidator : Validator<GetNewsPostByIdRequest>
{
    public GetNewsPostByIdValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
    }
}

public sealed record GetNewsPostByIdResponse
{
    public required int NewsPostId { get; init; }

    public required NewsPostState State { get; init; }

    public required string? Slug { get; init; }

    public required DateTimeOffset? PublishedAt { get; init; }

    public required DateTimeOffset? WithdrawnAt { get; init; }

    public required NewsPostAuthorDto? Author { get; init; }

    public required NewsPostAuthorDto? LastSavedBy { get; init; }

    public required int Revision { get; init; }

    public required DateTimeOffset UpdatedAt { get; init; }

    public required NewsPostVersionDto Content { get; init; }

    public required DateTimeOffset? PendingSavedAt { get; init; }

    public required NewsPostVersionDto? PendingChanges { get; init; }
}

public sealed record NewsPostAuthorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}

public sealed record NewsPostVersionDto
{
    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required string Text { get; init; }

    public required NewsCategory? Category { get; init; }

    public required NewsPostEventDto? Event { get; init; }

    public required NewsPostAlbumDto? Album { get; init; }

    public required PictureEditingDto? Picture { get; init; }

    public required string? PictureCaption { get; init; }
}

public sealed record NewsPostEventDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required string? VenueName { get; init; }

    public required bool IsCancelled { get; init; }
}

public sealed record NewsPostAlbumDto
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required bool IsPublished { get; init; }

    public required int PhotoCount { get; init; }

    public required PictureDto? Cover { get; init; }
}
