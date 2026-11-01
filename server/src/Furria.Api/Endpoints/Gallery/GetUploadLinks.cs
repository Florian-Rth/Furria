using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Gallery;
using Furria.Core.Gallery;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetUploadLinks : EndpointWithoutRequest<GetUploadLinksResponse>
{
    private readonly UploadLinkService _uploadLinkService;

    public GetUploadLinks(UploadLinkService uploadLinkService)
    {
        _uploadLinkService = uploadLinkService;
    }

    public override void Configure()
    {
        Get("gallery/upload-links");
        Definition.RequirePermission(FurriaPermissions.GalleryManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var links = await _uploadLinkService.GetLinksAsync(ct);

        await Send.OkAsync(
            new GetUploadLinksResponse { Links = [.. links.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static GetUploadLinksLinkDto ToDto(UploadLinkSummary link) =>
        new()
        {
            UploadLinkId = link.UploadLinkId,
            Title = link.Title,
            State = link.State,
            Token = link.Token,
            CreatedAt = link.CreatedAt,
            ExpiresAt = link.ExpiresAt,
            RevokedAt = link.RevokedAt,
            CreatedBy = link.CreatedBy is { } creator
                ? new GetUploadLinksCreatorDto
                {
                    PersonId = creator.PersonId,
                    FirstName = creator.FirstName,
                    LastName = creator.LastName,
                }
                : null,
            UploadCount = link.UploadCount,
            InboxPhotos = link.InboxPhotos,
            InboxVideos = link.InboxVideos,
        };
}

public sealed record GetUploadLinksResponse
{
    public required IReadOnlyList<GetUploadLinksLinkDto> Links { get; init; }
}

public sealed record GetUploadLinksLinkDto
{
    public required int UploadLinkId { get; init; }

    public required string Title { get; init; }

    public required UploadLinkState State { get; init; }

    public required string? Token { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }

    public required DateTimeOffset? RevokedAt { get; init; }

    public required GetUploadLinksCreatorDto? CreatedBy { get; init; }

    public required int UploadCount { get; init; }

    public required int InboxPhotos { get; init; }

    public required int InboxVideos { get; init; }
}

public sealed record GetUploadLinksCreatorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
