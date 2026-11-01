using Furria.Application.Gallery;
using Furria.Application.Results;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Gallery;

public sealed partial class GalleryService
{
    private const string UnknownUploadLinkMessage = "Diesen Sammellink gibt es nicht.";

    public async Task<Result<IReadOnlyList<GalleryItemSummary>>> GetUploadLinkInboxAsync(
        int uploadLinkId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.UploadLinks.AnyAsync(link => link.Id == uploadLinkId, ct))
            return Result<IReadOnlyList<GalleryItemSummary>>.NotFound(UnknownUploadLinkMessage);

        return Result<IReadOnlyList<GalleryItemSummary>>.Success(
            await _dbContext
                .MediaItems.AsNoTracking()
                .Where(item => item.OwnerUploadLinkId == uploadLinkId)
                .InCaptureOrder()
                .Select(ItemSummary())
                .ToListAsync(ct)
        );
    }
}
