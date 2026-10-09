using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Gallery;
using Furria.Core.Club;
using Furria.Core.Gallery;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class PostGalleryAlbum : Endpoint<PostGalleryAlbumRequest, PostGalleryAlbumResponse>
{
    private readonly GalleryService _galleryService;

    public PostGalleryAlbum(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Post("gallery/albums");
        Definition.RequireAnyPermission(GalleryKeys.Sorters);
    }

    public override async Task HandleAsync(PostGalleryAlbumRequest req, CancellationToken ct)
    {
        var result = await _galleryService.CreateAlbumAsync(
            new CreateAlbumCommand
            {
                Title = req.Title,
                Description = req.Description,
                CalendarEntryId = req.CalendarEntryId,
                SessionStartYear = req.SessionStartYear,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostGalleryAlbumResponse { AlbumId = result.Value },
            cancellation: ct
        );
    }
}

public sealed record PostGalleryAlbumRequest
{
    public required string Title { get; init; }

    public required string? Description { get; init; }

    public required int? CalendarEntryId { get; init; }

    public required int? SessionStartYear { get; init; }
}

public sealed class PostGalleryAlbumValidator : Validator<PostGalleryAlbumRequest>
{
    public PostGalleryAlbumValidator()
    {
        RuleFor(request => request.Title)
            .NotEmpty()
            .WithMessage(AlbumRequestMessages.TitleMissing)
            .MaximumLength(Album.TitleLength);
        RuleFor(request => request.Description).MaximumLength(Album.DescriptionLength);
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.SessionStartYear)
            .GreaterThanOrEqualTo(ClubSession.EarliestSessionYear)
            .WithMessage(AlbumRequestMessages.SessionTooEarly);
        RuleFor(request => request.SessionStartYear)
            .Null()
            .When(request => request.CalendarEntryId is not null)
            .WithMessage(AlbumRequestMessages.TwoLinks);
    }
}

public sealed record PostGalleryAlbumResponse
{
    public required int AlbumId { get; init; }
}
