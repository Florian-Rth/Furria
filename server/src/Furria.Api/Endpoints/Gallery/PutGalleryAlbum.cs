using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Club;
using Furria.Core.Gallery;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class PutGalleryAlbum : Endpoint<PutGalleryAlbumRequest>
{
    private readonly GalleryService _galleryService;

    public PutGalleryAlbum(GalleryService galleryService)
    {
        _galleryService = galleryService;
    }

    public override void Configure()
    {
        Put("gallery/albums/{albumId}");
        Definition.RequirePermission(FurriaPermissions.GalleryManage);
    }

    public override async Task HandleAsync(PutGalleryAlbumRequest req, CancellationToken ct)
    {
        var result = await _galleryService.UpdateAlbumAsync(
            new UpdateAlbumCommand
            {
                AlbumId = req.AlbumId,
                Title = req.Title,
                Description = req.Description,
                CalendarEntryId = req.CalendarEntryId,
                SessionStartYear = req.SessionStartYear,
                CoverMediaItemId = req.CoverMediaItemId,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutGalleryAlbumRequest
{
    [RouteParam]
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required string? Description { get; init; }

    public required int? CalendarEntryId { get; init; }

    public required int? SessionStartYear { get; init; }

    public required int? CoverMediaItemId { get; init; }
}

public sealed class PutGalleryAlbumValidator : Validator<PutGalleryAlbumRequest>
{
    public PutGalleryAlbumValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
        RuleFor(request => request.Title)
            .NotEmpty()
            .WithMessage(AlbumRequestMessages.TitleMissing)
            .MaximumLength(Album.TitleLength);
        RuleFor(request => request.Description).MaximumLength(Album.DescriptionLength);
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
        RuleFor(request => request.CoverMediaItemId).GreaterThan(0);
        RuleFor(request => request.SessionStartYear)
            .GreaterThanOrEqualTo(ClubSession.EarliestSessionYear)
            .WithMessage(AlbumRequestMessages.SessionTooEarly);
        RuleFor(request => request.SessionStartYear)
            .Null()
            .When(request => request.CalendarEntryId is not null)
            .WithMessage(AlbumRequestMessages.TwoLinks);
    }
}
