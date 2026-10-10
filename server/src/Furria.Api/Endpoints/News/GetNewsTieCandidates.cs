using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Media;
using Furria.Application.Authorization;
using Furria.Application.News;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class GetNewsTieCandidates : EndpointWithoutRequest<GetNewsTieCandidatesResponse>
{
    private readonly NewsService _newsService;

    public GetNewsTieCandidates(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Get("news/tie-candidates");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var candidates = await _newsService.GetTieCandidatesAsync(ct);

        await Send.OkAsync(ToResponse(candidates), cancellation: ct);
    }

    private static GetNewsTieCandidatesResponse ToResponse(NewsTieCandidates candidates) =>
        new()
        {
            Events =
            [
                .. candidates.Events.Select(tie => new TieableEventDto
                {
                    EventId = tie.EventId,
                    Title = tie.Title,
                    StartsAt = tie.StartsAt,
                    EndsAt = tie.EndsAt,
                    VenueName = tie.VenueName,
                    IsCancelled = tie.IsCancelled,
                }),
            ],
            Albums =
            [
                .. candidates.Albums.Select(album => new TieableAlbumDto
                {
                    AlbumId = album.AlbumId,
                    Title = album.Title,
                    SessionStartYear = album.SessionStartYear,
                    PhotoCount = album.PhotoCount,
                    Cover = PictureDto.From(album.Cover),
                }),
            ],
        };
}

public sealed record GetNewsTieCandidatesResponse
{
    public required IReadOnlyList<TieableEventDto> Events { get; init; }

    public required IReadOnlyList<TieableAlbumDto> Albums { get; init; }
}

public sealed record TieableEventDto
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required string? VenueName { get; init; }

    public required bool IsCancelled { get; init; }
}

public sealed record TieableAlbumDto
{
    public required int AlbumId { get; init; }

    public required string Title { get; init; }

    public required int? SessionStartYear { get; init; }

    public required int PhotoCount { get; init; }

    public required PictureDto? Cover { get; init; }
}
