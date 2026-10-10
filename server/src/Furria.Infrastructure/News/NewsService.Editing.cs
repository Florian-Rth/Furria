using Furria.Application.News;
using Furria.Application.Results;
using Furria.Core.News;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.News;

public sealed partial class NewsService
{
    private const int FirstRevision = 1;

    public async Task<Result<int>> CreateAsync(CreateNewsPostCommand command, CancellationToken ct)
    {
        var refusal = await ContentRefusalAsync(command.Content, null, ct);
        if (!refusal.IsSuccess)
            return Result<int>.Carrying(refusal);

        var post = new NewsPost
        {
            AuthorPersonId = command.AuthorPersonId,
            LastSavedByPersonId = command.AuthorPersonId,
            Revision = FirstRevision,
        };
        await WriteContentAsync(post, command.Content, ct);
        _dbContext.NewsPosts.Add(post);
        await _dbContext.SaveChangesAsync(ct);

        return Result<int>.Success(post.Id);
    }

    public async Task<Result<NewsPostSaveDetails>> SaveAsync(
        SaveNewsPostCommand command,
        CancellationToken ct
    )
    {
        var post = await PostAsync(command.NewsPostId, ct);
        if (post is null)
            return Result<NewsPostSaveDetails>.NotFound(UnknownPostMessage);

        var isLive = NewsWorkingCopy.IsLive(post);
        var replaced = isLive
            ? NewsWorkingCopy.PendingContentOf(post) ?? NewsWorkingCopy.ContentOf(post)
            : NewsWorkingCopy.ContentOf(post);
        var refusal = await ContentRefusalAsync(command.Content, replaced, ct);
        if (!refusal.IsSuccess)
            return Result<NewsPostSaveDetails>.Carrying(refusal);

        if (isLive)
            NewsWorkingCopy.Write(post, command.Content, _timeProvider.GetUtcNow());
        else
            await WriteContentAsync(post, command.Content, ct);

        var savedInBetween =
            post.Revision == command.BasedOnRevision ? null : await LastSaveOfAsync(post, ct);
        NewsWorkingCopy.MarkSaved(post, command.SavedByPersonId);
        await _dbContext.SaveChangesAsync(ct);

        return Result<NewsPostSaveDetails>.Success(
            new NewsPostSaveDetails { Revision = post.Revision, SavedInBetween = savedInBetween }
        );
    }

    private async Task<NewsSaveInBetween> LastSaveOfAsync(NewsPost post, CancellationToken ct) =>
        new(
            await _dbContext
                .People.AsNoTracking()
                .Where(person => person.Id == post.LastSavedByPersonId)
                .Select(person => new NewsAuthor(person.Id, person.FirstName, person.LastName))
                .SingleOrDefaultAsync(ct),
            post.UpdatedAt
        );
}
