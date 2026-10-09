using Furria.Application.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public sealed class PictureLookup
{
    private readonly AppDbContext _dbContext;
    private readonly MediaPictures _pictures;

    public PictureLookup(AppDbContext dbContext, MediaPictures pictures)
    {
        _dbContext = dbContext;
        _pictures = pictures;
    }

    public async Task<IReadOnlyDictionary<int, PictureDetails>> PortraitsOfAsync(
        IReadOnlyCollection<int> personIds,
        CancellationToken ct
    )
    {
        if (personIds.Count == 0)
            return new Dictionary<int, PictureDetails>();

        var stamps = await _dbContext
            .People.AsNoTracking()
            .Where(person => personIds.Contains(person.Id) && person.Portrait!.RenderedAt != null)
            .Select(person => new PictureStamp(
                person.Id,
                person.PortraitId!.Value,
                person.Portrait!.RenderedAt!.Value
            ))
            .ToListAsync(ct);

        return stamps.ToDictionary(
            stamp => stamp.OwnerId,
            stamp => _pictures.PortraitOf(stamp.OwnerId, stamp.MediaItemId, stamp.RenderedAt)!
        );
    }

    public async Task<PictureDetails?> PortraitOfAsync(int personId, CancellationToken ct) =>
        (await PortraitsOfAsync([personId], ct)).GetValueOrDefault(personId);

    public async Task<IReadOnlyDictionary<int, PictureDetails>> GroupPicturesOfAsync(
        IReadOnlyCollection<int> groupIds,
        CancellationToken ct
    ) =>
        (await GroupPictureStampsOfAsync(groupIds, ct)).ToDictionary(
            stamp => stamp.OwnerId,
            stamp => _pictures.GroupPictureOf(stamp.OwnerId, stamp.MediaItemId, stamp.RenderedAt)!
        );

    public async Task<IReadOnlyDictionary<int, PictureDetails>> PublicGroupPicturesOfAsync(
        IReadOnlyCollection<int> groupIds,
        CancellationToken ct
    ) =>
        (await GroupPictureStampsOfAsync(groupIds, ct)).ToDictionary(
            stamp => stamp.OwnerId,
            stamp => MediaPictures.PublicGroupPictureOf(stamp.MediaItemId, stamp.RenderedAt)!
        );

    public async Task<PictureDetails?> GroupPictureOfAsync(int groupId, CancellationToken ct) =>
        (await GroupPicturesOfAsync([groupId], ct)).GetValueOrDefault(groupId);

    private async Task<IReadOnlyList<PictureStamp>> GroupPictureStampsOfAsync(
        IReadOnlyCollection<int> groupIds,
        CancellationToken ct
    ) =>
        groupIds.Count == 0
            ? []
            : await _dbContext
                .Groups.AsNoTracking()
                .Where(group => groupIds.Contains(group.Id) && group.Picture!.RenderedAt != null)
                .Select(group => new PictureStamp(
                    group.Id,
                    group.PictureId!.Value,
                    group.Picture!.RenderedAt!.Value
                ))
                .ToListAsync(ct);

    private sealed record PictureStamp(int OwnerId, int MediaItemId, DateTimeOffset RenderedAt);
}
