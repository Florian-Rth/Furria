using Furria.Core.Website;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class WebsitePictureExpectations
{
    private readonly Expected _expected;
    private readonly string _slotKey;
    private readonly int _position;

    internal WebsitePictureExpectations(Expected expected, string slotKey, int position)
    {
        _expected = expected;
        _slotKey = slotKey;
        _position = position;
    }

    public Expected ToBeFilledBy(int mediaItemId, double aspect, string? alt = null) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var picture = await SingleOrDefaultAsync(dbContext, ct);
                Assert.NotNull(picture);
                Assert.Equal(mediaItemId, picture.MediaItemId);
                Assert.Equal(aspect, picture.Aspect, 1e-9);
                Assert.Equal(alt, picture.Alt);
            }
        );

    public Expected ToBeUpdatedBy(int? personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var picture = await SingleOrDefaultAsync(dbContext, ct);
                Assert.NotNull(picture);
                Assert.Equal(personId, picture.UpdatedByPersonId);
            }
        );

    public Expected ToBeEmpty() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null(await SingleOrDefaultAsync(dbContext, ct))
        );

    private Task<WebsitePicture?> SingleOrDefaultAsync(
        AppDbContext dbContext,
        CancellationToken ct
    ) =>
        dbContext
            .WebsitePictures.AsNoTracking()
            .SingleOrDefaultAsync(
                picture => picture.SlotKey == _slotKey && picture.Position == _position,
                ct
            );
}
