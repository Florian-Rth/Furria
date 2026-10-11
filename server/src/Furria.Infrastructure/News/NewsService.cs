using System.Diagnostics.Contracts;
using Furria.Application.News;
using Furria.Application.Results;
using Furria.Core.News;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Public;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.News;

public sealed partial class NewsService
{
    private const string UnknownPostMessage = "Diese Meldung gibt es nicht.";
    private const string UnknownEventMessage = "Diese Veranstaltung gibt es nicht.";
    private const string UntieableAlbumMessage =
        "Eine Meldung zeigt nur ein Album, das auf der Website veröffentlicht ist.";

    private readonly AppDbContext _dbContext;
    private readonly NewsPictures _newsPictures;
    private readonly MediaPictures _pictures;
    private readonly PublicFace _publicFace;
    private readonly TimeProvider _timeProvider;

    public NewsService(
        AppDbContext dbContext,
        NewsPictures newsPictures,
        MediaPictures pictures,
        PublicFace publicFace,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _newsPictures = newsPictures;
        _pictures = pictures;
        _publicFace = publicFace;
        _timeProvider = timeProvider;
    }

    private Task<NewsPost?> PostAsync(int newsPostId, CancellationToken ct) =>
        _dbContext
            .NewsPosts.Include(post => post.Mentions)
            .SingleOrDefaultAsync(post => post.Id == newsPostId, ct);

    private async Task<Result> ContentRefusalAsync(
        NewsPostContent content,
        NewsPostContent? replaced,
        CancellationToken ct
    )
    {
        if (NewsText.Read(content.Text).Refusal is { } refusal)
            return Result.Validation(refusal);

        if (
            content.EventId is { } eventId
            && eventId != replaced?.EventId
            && !await _dbContext.Events.AnyAsync(row => row.CalendarEntryId == eventId, ct)
        )
            return Result.Validation(UnknownEventMessage);

        if (
            content.AlbumId is { } albumId
            && albumId != replaced?.AlbumId
            && !await _publicFace.Albums.AnyAsync(album => album.Id == albumId, ct)
        )
            return Result.Validation(UntieableAlbumMessage);

        return Result.Success();
    }

    private async Task WriteContentAsync(
        NewsPost post,
        NewsPostContent content,
        CancellationToken ct
    )
    {
        post.Title = content.Title;
        post.Teaser = content.Teaser;
        post.Text = content.Text;
        post.Category = content.Category;
        post.EventId = content.EventId;
        post.AlbumId = content.AlbumId;
        post.PictureCaption = content.PictureCaption;
        await RewriteMentionsAsync(post, ct);
    }

    private async Task RewriteMentionsAsync(NewsPost post, CancellationToken ct)
    {
        var mentions = NewsText.Read(post.Text).Mentions;
        var groupIds = TargetsOf(mentions, NewsMentionKind.Group);
        var personIds = TargetsOf(mentions, NewsMentionKind.Person);
        var groups = await _dbContext
            .Groups.Where(group => groupIds.Contains(group.Id))
            .Select(group => group.Id)
            .ToListAsync(ct);
        var persons = await _dbContext
            .People.Where(person => personIds.Contains(person.Id))
            .Select(person => person.Id)
            .ToListAsync(ct);

        post.Mentions.Clear();
        foreach (var groupId in groups)
            post.Mentions.Add(new NewsPostMention { GroupId = groupId });
        foreach (var personId in persons)
            post.Mentions.Add(new NewsPostMention { PersonId = personId });
    }

    [Pure]
    private static List<int> TargetsOf(IReadOnlyList<NewsMention> mentions, NewsMentionKind kind) =>
        [.. mentions.Where(mention => mention.Kind == kind).Select(mention => mention.TargetId)];
}
