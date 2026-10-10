using System.Diagnostics.Contracts;
using Furria.Application.News;
using Furria.Core.News;

namespace Furria.Infrastructure.News;

internal static class NewsWorkingCopy
{
    [Pure]
    public static bool IsLive(NewsPost post) =>
        NewsPostStates.Of(post.PublishedAt, post.WithdrawnAt) == NewsPostState.Published;

    [Pure]
    public static NewsPostContent ContentOf(NewsPost post) =>
        new()
        {
            Title = post.Title,
            Teaser = post.Teaser,
            Text = post.Text,
            Category = post.Category,
            EventId = post.EventId,
            AlbumId = post.AlbumId,
            PictureCaption = post.PictureCaption,
        };

    [Pure]
    public static NewsPostContent? PendingContentOf(NewsPost post) =>
        post.PendingSavedAt is null
            ? null
            : new()
            {
                Title = post.PendingTitle,
                Teaser = post.PendingTeaser,
                Text = post.PendingText,
                Category = post.PendingCategory,
                EventId = post.PendingEventId,
                AlbumId = post.PendingAlbumId,
                PictureCaption = post.PendingPictureCaption,
            };

    [Pure]
    public static int? WorkingPictureIdOf(NewsPost post) =>
        IsLive(post) && post.PendingSavedAt is not null ? post.PendingPictureId : post.PictureId;

    public static void Write(NewsPost post, NewsPostContent content, DateTimeOffset savedAt)
    {
        if (post.PendingSavedAt is null)
            post.PendingPictureId = post.PictureId;

        post.PendingSavedAt = savedAt;
        post.PendingTitle = content.Title;
        post.PendingTeaser = content.Teaser;
        post.PendingText = content.Text;
        post.PendingCategory = content.Category;
        post.PendingEventId = content.EventId;
        post.PendingAlbumId = content.AlbumId;
        post.PendingPictureCaption = content.PictureCaption;
    }

    public static void PlacePicture(NewsPost post, int? mediaItemId, DateTimeOffset savedAt)
    {
        if (!IsLive(post))
        {
            post.PictureId = mediaItemId;
            return;
        }

        Write(post, PendingContentOf(post) ?? ContentOf(post), savedAt);
        post.PendingPictureId = mediaItemId;
    }

    public static void MarkSaved(NewsPost post, int? savedByPersonId)
    {
        post.Revision++;
        post.LastSavedByPersonId = savedByPersonId;
    }

    public static void Drop(NewsPost post)
    {
        post.PendingSavedAt = null;
        post.PendingTitle = "";
        post.PendingTeaser = "";
        post.PendingText = "";
        post.PendingCategory = null;
        post.PendingEventId = null;
        post.PendingAlbumId = null;
        post.PendingPictureId = null;
        post.PendingPictureCaption = null;
    }
}
