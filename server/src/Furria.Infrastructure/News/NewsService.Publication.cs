using System.Diagnostics.Contracts;
using Furria.Application.News;
using Furria.Application.Results;
using Furria.Core.News;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.News;

public sealed partial class NewsService
{
    private const string IncompleteMessage =
        "Zum Veröffentlichen braucht die Meldung Titel, Vorspann, Text und Kategorie.";
    private const string NotLiveMessage =
        "Nur eine veröffentlichte Meldung lässt sich zurückziehen.";
    private const string NoPendingChangesMessage = "Diese Meldung hat keine offenen Änderungen.";
    private const string LiveDeletionMessage =
        "Eine veröffentlichte Meldung muss erst zurückgezogen werden, bevor sie gelöscht wird.";
    private const char SlugSeparator = '-';

    public async Task<Result<NewsPublication>> PublishAsync(
        int newsPostId,
        int? publishedByPersonId,
        CancellationToken ct
    )
    {
        var post = await PostAsync(newsPostId, ct);
        if (post is null)
            return Result<NewsPublication>.NotFound(UnknownPostMessage);

        var state = NewsPostStates.Of(post.PublishedAt, post.WithdrawnAt);
        if (state == NewsPostState.Published)
            return Result<NewsPublication>.Success(PublicationOf(post));

        if (!IsComplete(NewsWorkingCopy.ContentOf(post)))
            return Result<NewsPublication>.Conflict(IncompleteMessage);

        if (state == NewsPostState.Draft)
            await FixAddressAndDateAsync(post, ct);
        else
            post.WithdrawnAt = null;

        NewsWorkingCopy.MarkSaved(post, publishedByPersonId);
        await _dbContext.SaveChangesAsync(ct);
        return Result<NewsPublication>.Success(PublicationOf(post));
    }

    public async Task<Result> WithdrawAsync(
        int newsPostId,
        int? withdrawnByPersonId,
        CancellationToken ct
    )
    {
        var post = await PostAsync(newsPostId, ct);
        if (post is null)
            return Result.NotFound(UnknownPostMessage);

        if (!NewsWorkingCopy.IsLive(post))
            return Result.Conflict(NotLiveMessage);

        var dropped = NewsWorkingCopy.PendingContentOf(post) is { } pending
            ? await AdoptPendingChangesAsync(post, pending, ct)
            : [];

        post.WithdrawnAt = _timeProvider.GetUtcNow();
        NewsWorkingCopy.MarkSaved(post, withdrawnByPersonId);
        await _dbContext.SaveChangesAsync(ct);
        _newsPictures.DeleteFilesOf(dropped);
        return Result.Success();
    }

    public async Task<Result<NewsPublication>> PublishChangesAsync(
        int newsPostId,
        int? publishedByPersonId,
        CancellationToken ct
    )
    {
        var post = await PostAsync(newsPostId, ct);
        if (post is null)
            return Result<NewsPublication>.NotFound(UnknownPostMessage);

        if (NewsWorkingCopy.PendingContentOf(post) is not { } pending)
            return Result<NewsPublication>.Conflict(NoPendingChangesMessage);

        if (!IsComplete(pending))
            return Result<NewsPublication>.Conflict(IncompleteMessage);

        var dropped = await AdoptPendingChangesAsync(post, pending, ct);
        NewsWorkingCopy.MarkSaved(post, publishedByPersonId);
        await _dbContext.SaveChangesAsync(ct);
        _newsPictures.DeleteFilesOf(dropped);
        return Result<NewsPublication>.Success(PublicationOf(post));
    }

    public async Task<Result> DiscardChangesAsync(
        int newsPostId,
        int? discardedByPersonId,
        CancellationToken ct
    )
    {
        var post = await PostAsync(newsPostId, ct);
        if (post is null)
            return Result.NotFound(UnknownPostMessage);

        if (post.PendingSavedAt is null)
            return Result.Success();

        NewsWorkingCopy.Drop(post);
        var dropped = await _newsPictures.DropUnusedAsync(post, ct);
        NewsWorkingCopy.MarkSaved(post, discardedByPersonId);
        await _dbContext.SaveChangesAsync(ct);
        _newsPictures.DeleteFilesOf(dropped);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int newsPostId, CancellationToken ct)
    {
        var post = await PostAsync(newsPostId, ct);
        if (post is null)
            return Result.NotFound(UnknownPostMessage);

        if (NewsWorkingCopy.IsLive(post))
            return Result.Conflict(LiveDeletionMessage);

        var pictures = await _newsPictures.AllOfAsync(post.Id, ct);
        _dbContext.NewsPosts.Remove(post);
        await _dbContext.SaveChangesAsync(ct);
        _newsPictures.DeleteFilesOf(pictures);
        return Result.Success();
    }

    private async Task<IReadOnlyList<Guid>> AdoptPendingChangesAsync(
        NewsPost post,
        NewsPostContent pending,
        CancellationToken ct
    )
    {
        await WriteContentAsync(post, pending, ct);
        post.PictureId = post.PendingPictureId;
        NewsWorkingCopy.Drop(post);
        return await _newsPictures.DropUnusedAsync(post, ct);
    }

    private async Task FixAddressAndDateAsync(NewsPost post, CancellationToken ct)
    {
        var slug = NewsSlug.Of(post.Title);
        var numbered = $"{slug}{SlugSeparator}";
        var taken = await _dbContext
            .NewsPosts.Where(other =>
                other.Slug != null && (other.Slug == slug || other.Slug.StartsWith(numbered))
            )
            .Select(other => other.Slug!)
            .ToListAsync(ct);

        post.Slug = NewsSlug.FirstFreeOf(slug, taken);
        post.PublishedAt = _timeProvider.GetUtcNow();
    }

    [Pure]
    private static bool IsComplete(NewsPostContent content) =>
        NewsPublicationRequirements
            .MissingOf(content.Title, content.Teaser, content.Text, content.Category)
            .Count == 0;

    [Pure]
    private static NewsPublication PublicationOf(NewsPost post) =>
        new(post.Slug!, post.PublishedAt!.Value, post.Revision);
}
