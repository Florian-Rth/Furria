using System.Text;
using Furria.Application.Gallery;
using Furria.Application.Media;
using Furria.Application.Results;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Gallery;

public sealed class UploadLinkService
{
    private const string UnknownLinkMessage = "Diesen Sammellink gibt es nicht.";

    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;
    private readonly byte[] _key;

    public UploadLinkService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        IOptions<MediaOptions> options,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
        _key = Encoding.UTF8.GetBytes(options.Value.SigningKey);
    }

    public async Task<CreatedUploadLinkDetails> CreateAsync(
        CreateUploadLinkCommand command,
        CancellationToken ct
    )
    {
        var now = _timeProvider.GetUtcNow();
        var seed = UploadLinkTokens.NewSeed();
        var link = new UploadLink
        {
            Title = command.Title.Trim(),
            TokenSeed = seed,
            TokenHash = UploadLinkTokens.HashOf(_key, seed),
            CreatedByPersonId = await _authorizer.ActivePersonIdAsync(command.ActorAccountId, ct),
            ExpiresAt = UploadLink.ExpiryFor(now),
        };
        _dbContext.UploadLinks.Add(link);
        await _dbContext.SaveChangesAsync(ct);

        return new CreatedUploadLinkDetails
        {
            UploadLinkId = link.Id,
            Token = UploadLinkTokens.TokenOf(_key, seed),
            ExpiresAt = link.ExpiresAt,
        };
    }

    public async Task<IReadOnlyList<UploadLinkSummary>> GetLinksAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var rows = await _dbContext
            .UploadLinks.AsNoTracking()
            .OrderByDescending(link => link.CreatedAt)
            .ThenByDescending(link => link.Id)
            .Select(link => new LinkRow(
                link,
                link.CreatedBy == null
                    ? null
                    : new GalleryUploader(
                        link.CreatedBy.Id,
                        link.CreatedBy.FirstName,
                        link.CreatedBy.LastName
                    ),
                link.InboxItems.Count(item => item.Kind == MediaKind.Photo),
                link.InboxItems.Count(item => item.Kind == MediaKind.Video)
            ))
            .ToListAsync(ct);

        return [.. rows.Select(row => SummaryOf(row, now))];
    }

    public async Task<Result> RevokeAsync(int uploadLinkId, CancellationToken ct)
    {
        var link = await _dbContext.UploadLinks.SingleOrDefaultAsync(
            row => row.Id == uploadLinkId,
            ct
        );
        if (link is null)
            return Result.NotFound(UnknownLinkMessage);

        var now = _timeProvider.GetUtcNow();
        if (link.StateAt(now) == UploadLinkState.Open)
        {
            link.RevokedAt = now;
            await _dbContext.SaveChangesAsync(ct);
        }

        return Result.Success();
    }

    public async Task<UploadLinkLookupDetails?> LookUpAsync(
        string presentedToken,
        CancellationToken ct
    )
    {
        var link = await LinkOfAsync(presentedToken, ct);

        return link is null
            ? null
            : new UploadLinkLookupDetails
            {
                Title = link.Title,
                State = link.StateAt(_timeProvider.GetUtcNow()),
                ExpiresAt = link.ExpiresAt,
            };
    }

    public async Task<UploadLinkPass?> PassOfAsync(string presentedToken, CancellationToken ct)
    {
        var link = await LinkOfAsync(presentedToken, ct);

        return link is null
            ? null
            : new UploadLinkPass
            {
                UploadLinkId = link.Id,
                State = link.StateAt(_timeProvider.GetUtcNow()),
                UploadedBytes = link.UploadedBytes,
            };
    }

    private async Task<UploadLink?> LinkOfAsync(string presentedToken, CancellationToken ct) =>
        UploadLinkTokens.HashOfPresented(presentedToken) is { } tokenHash
            ? await _dbContext
                .UploadLinks.AsNoTracking()
                .SingleOrDefaultAsync(link => link.TokenHash == tokenHash, ct)
            : null;

    private UploadLinkSummary SummaryOf(LinkRow row, DateTimeOffset now)
    {
        var state = row.Link.StateAt(now);

        return new UploadLinkSummary
        {
            UploadLinkId = row.Link.Id,
            Title = row.Link.Title,
            State = state,
            Token =
                state == UploadLinkState.Open
                    ? UploadLinkTokens.TokenOf(_key, row.Link.TokenSeed)
                    : null,
            CreatedAt = row.Link.CreatedAt,
            ExpiresAt = row.Link.ExpiresAt,
            RevokedAt = row.Link.RevokedAt,
            CreatedBy = row.CreatedBy,
            UploadCount = row.Link.UploadCount,
            InboxPhotos = row.InboxPhotos,
            InboxVideos = row.InboxVideos,
        };
    }

    private sealed record LinkRow(
        UploadLink Link,
        GalleryUploader? CreatedBy,
        int InboxPhotos,
        int InboxVideos
    );
}
