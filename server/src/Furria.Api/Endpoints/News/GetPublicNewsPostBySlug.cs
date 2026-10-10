using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Application.Gallery;
using Furria.Application.News;
using Furria.Core.Groups;
using Furria.Core.News;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class GetPublicNewsPostBySlug
    : Endpoint<GetPublicNewsPostBySlugRequest, GetPublicNewsPostBySlugResponse>
{
    private readonly NewsService _newsService;

    public GetPublicNewsPostBySlug(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Get("public/news/{slug}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetPublicNewsPostBySlugRequest req, CancellationToken ct)
    {
        var details = await _newsService.GetPublicNewsPostAsync(req.Slug, ct);
        if (details is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(details), cancellation: ct);
    }

    private static GetPublicNewsPostBySlugResponse ToResponse(PublicNewsDetails details) =>
        new()
        {
            Slug = details.Slug,
            Title = details.Title,
            Teaser = details.Teaser,
            Text = details.Text,
            Category = details.Category,
            PublishedAt = details.PublishedAt,
            Author = details.Author is { } author
                ? new PublicNewsAuthorDto
                {
                    FirstName = author.FirstName,
                    LastName = author.LastName,
                }
                : null,
            Picture = PictureDto.From(details.Picture),
            PictureCaption = details.PictureCaption,
            MentionedGroups = [.. details.MentionedGroups.Select(ToDto)],
            MentionedPersons = [.. details.MentionedPersons.Select(ToDto)],
            Event = details.Event is { } tiedEvent ? ToDto(tiedEvent) : null,
            Album = details.Album is { } album ? ToDto(album) : null,
        };

    private static PublicNewsGroupDto ToDto(MentionableGroup group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Description = group.Description,
            Tone = group.Tone,
            Picture = PictureDto.From(group.Picture),
        };

    private static PublicNewsPersonDto ToDto(MentionablePerson person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
            OfficeName = person.OfficeName,
            Portrait = PictureDto.From(person.Portrait),
        };

    private static PublicNewsEventDto ToDto(NewsEventTie tiedEvent) =>
        new()
        {
            EventId = tiedEvent.EventId,
            Title = tiedEvent.Title,
            StartsAt = tiedEvent.StartsAt,
            EndsAt = tiedEvent.EndsAt,
            VenueName = tiedEvent.VenueName,
            IsCancelled = tiedEvent.IsCancelled,
        };

    private static PublicNewsAlbumDto ToDto(PublicNewsAlbum album) =>
        new()
        {
            AlbumId = album.AlbumId,
            Title = album.Title,
            PhotoCount = album.PhotoCount,
            Photos = [.. album.Photos.Select(ToDto)],
        };

    private static PublicNewsAlbumPhotoDto ToDto(PublicGalleryPhoto photo) =>
        new()
        {
            MediaItemId = photo.MediaItemId,
            Width = photo.Width,
            Height = photo.Height,
            Caption = photo.Caption,
            SmallUrl = photo.Picture.SmallUrl,
            MediumUrl = photo.Picture.MediumUrl,
            LargeUrl = photo.Picture.LargeUrl,
        };
}

public sealed record GetPublicNewsPostBySlugRequest
{
    [RouteParam]
    public required string Slug { get; init; }
}

public sealed class GetPublicNewsPostBySlugValidator : Validator<GetPublicNewsPostBySlugRequest>
{
    public GetPublicNewsPostBySlugValidator()
    {
        RuleFor(request => request.Slug).NotEmpty().MaximumLength(NewsSlug.StoredLength);
    }
}

public sealed record GetPublicNewsPostBySlugResponse
{
    public required string Slug { get; init; }

    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required string Text { get; init; }

    public required NewsCategory Category { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required PublicNewsAuthorDto? Author { get; init; }

    public required PictureDto? Picture { get; init; }

    public required string? PictureCaption { get; init; }

    public required IReadOnlyList<PublicNewsGroupDto> MentionedGroups { get; init; }

    public required IReadOnlyList<PublicNewsPersonDto> MentionedPersons { get; init; }

    public required PublicNewsEventDto? Event { get; init; }

    public required PublicNewsAlbumDto? Album { get; init; }
}

public sealed record PublicNewsAuthorDto
{
    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}

public sealed record PublicNewsGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required GroupTone? Tone { get; init; }

    public required PictureDto? Picture { get; init; }
}

public sealed record PublicNewsPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string OfficeName { get; init; }

    public required PictureDto? Portrait { get; init; }
}

public sealed record PublicNewsEventDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required string? VenueName { get; init; }

    public required bool IsCancelled { get; init; }
}

public sealed record PublicNewsAlbumDto
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required int PhotoCount { get; init; }

    public required IReadOnlyList<PublicNewsAlbumPhotoDto> Photos { get; init; }
}

public sealed record PublicNewsAlbumPhotoDto
{
    public required int MediaItemId { get; init; }

    public required int Width { get; init; }

    public required int Height { get; init; }

    public required string? Caption { get; init; }

    public required string SmallUrl { get; init; }

    public required string MediumUrl { get; init; }

    public required string LargeUrl { get; init; }
}
