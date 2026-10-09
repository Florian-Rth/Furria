using Furria.Core.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class MediaItemExpectations
{
    private readonly Expected _expected;
    private readonly int _mediaItemId;

    internal MediaItemExpectations(Expected expected, int mediaItemId)
    {
        _expected = expected;
        _mediaItemId = mediaItemId;
    }

    public Expected ToAwaitItsRenditions(MediaKind kind, string contentType) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(kind, item.Kind);
                Assert.Equal(contentType, item.ContentType);
                Assert.Equal(MediaItemState.Processing, item.State);
                Assert.Equal(
                    1,
                    await dbContext.MediaJobs.CountAsync(
                        job => job.MediaItemId == _mediaItemId && job.ClaimedAt == null,
                        ct
                    )
                );
            }
        );

    public Expected ToBeReady(int width, int height) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(MediaItemState.Ready, item.State);
                Assert.Null(item.FailureReason);
                Assert.Equal((width, height), (item.Width, item.Height));
                Assert.False(await JobsOf(dbContext).AnyAsync(ct));
            }
        );

    public Expected ToBeIn(MediaItemState state) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(state, (await SingleAsync(dbContext, ct)).State)
        );

    public Expected ToBeCapturedAt(DateTimeOffset? capturedAt, string? camera) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(capturedAt, item.CapturedAt);
                Assert.Equal(camera, item.Camera);
            }
        );

    public Expected ToLastAbout(double seconds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.NotNull(item.DurationSeconds);
                Assert.InRange(item.DurationSeconds.Value, seconds - 0.2, seconds + 0.2);
            }
        );

    public Expected ToAwaitARetry(DateTimeOffset notBefore) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(MediaItemState.Processing, item.State);
                var job = await JobsOf(dbContext).SingleAsync(ct);
                Assert.Null(job.ClaimedAt);
                Assert.Equal(notBefore, job.AvailableAt);
            }
        );

    public Expected ToHaveFailedWith(string reasonFragment) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(MediaItemState.Failed, item.State);
                Assert.Contains(reasonFragment, item.FailureReason ?? "");
                Assert.False(await JobsOf(dbContext).AnyAsync(ct));
            }
        );

    public Expected ToBeOwnedBy(MediaOwner owner) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(owner, MediaOwner.Of(await SingleAsync(dbContext, ct)))
        );

    public Expected ToBeUploadedAs(int? uploadedByPersonId, string fileName, long byteSize) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(uploadedByPersonId, item.UploadedByPersonId);
                Assert.Equal(fileName, item.OriginalFileName);
                Assert.Equal(byteSize, item.ByteSize);
            }
        );

    public Expected ToBeThePortraitOf(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    _mediaItemId,
                    await dbContext
                        .People.Where(person => person.Id == personId)
                        .Select(person => person.PortraitId)
                        .SingleAsync(ct)
                )
        );

    public Expected ToBeThePictureOfGroup(int groupId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    _mediaItemId,
                    await dbContext
                        .Groups.Where(group => group.Id == groupId)
                        .Select(group => group.PictureId)
                        .SingleAsync(ct)
                )
        );

    public Expected ToBeCroppedTo(PictureCrop crop) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var stored = (await SingleAsync(dbContext, ct)).Crop;
                Assert.NotNull(stored);
                Assert.Equal(
                    crop,
                    new PictureCrop(stored.Left, stored.Top, stored.Width, stored.Height)
                );
            }
        );

    public Expected ToBeGone() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(await dbContext.MediaItems.AnyAsync(row => row.Id == _mediaItemId, ct))
        );

    private IQueryable<MediaJob> JobsOf(AppDbContext dbContext) =>
        dbContext.MediaJobs.AsNoTracking().Where(job => job.MediaItemId == _mediaItemId);

    private Task<MediaItem> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.MediaItems.AsNoTracking().SingleAsync(row => row.Id == _mediaItemId, ct);
}
