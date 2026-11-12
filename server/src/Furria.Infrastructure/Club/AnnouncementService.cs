using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Text;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class AnnouncementService
{
    private const string UnknownAnnouncementMessage = "Diesen Aushang gibt es nicht mehr.";
    private const string ForeignAnnouncementMessage =
        "Diesen Aushang hat jemand anderes geschrieben.";

    private readonly AppDbContext _dbContext;
    private readonly RunningBoardSeats _runningBoardSeats;
    private readonly MediaPictures _pictures;
    private readonly AnnouncementMentionTargetsQuery _mentionTargets;
    private readonly TimeProvider _timeProvider;

    public AnnouncementService(
        AppDbContext dbContext,
        RunningBoardSeats runningBoardSeats,
        MediaPictures pictures,
        AnnouncementMentionTargetsQuery mentionTargets,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _runningBoardSeats = runningBoardSeats;
        _pictures = pictures;
        _mentionTargets = mentionTargets;
        _timeProvider = timeProvider;
    }

    public Task<AnnouncementMentionTargets> GetMentionablesAsync(
        MentionReader reader,
        CancellationToken ct
    ) => _mentionTargets.OfferedToAsync(reader, ct);

    public async Task<IReadOnlyList<AnnouncementSummary>> GetAnnouncementsAsync(
        MentionReader reader,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .Announcements.AsNoTracking()
            .OrderByDescending(announcement => announcement.PublishedAt)
            .ThenByDescending(announcement => announcement.Id)
            .Select(AnnouncementRows.Projection)
            .ToListAsync(ct);

        var officeNames = await _runningBoardSeats.OfficeNamesAsync(today, ct);
        var mentions = await _mentionTargets.OfAnnouncementsAsync(
            [.. rows.Select(row => row.AnnouncementId)],
            reader,
            ct
        );

        return [.. rows.Select(row => ToSummary(row, officeNames, mentions, _pictures))];
    }

    public async Task<Result<int>> CreateAsync(
        CreateAnnouncementCommand command,
        CancellationToken ct
    )
    {
        var reading = AnnouncementText.Read(command.Body);
        if (reading.Refusal is { } refusal)
            return Result<int>.Validation(refusal);

        var announcement = new Announcement
        {
            AuthorPersonId = command.AuthorPersonId,
            Title = command.Title,
            Body = command.Body,
            PublishedAt = _timeProvider.GetUtcNow(),
            ValidUntil = command.ValidUntil,
        };
        RewriteMentions(announcement, reading);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        _dbContext.Announcements.Add(announcement);
        await _dbContext.SaveChangesAsync(ct);
        await EnqueuePostedPushesAsync(announcement, ct);
        await transaction.CommitAsync(ct);

        return Result<int>.Success(announcement.Id);
    }

    public async Task<Result> UpdateAsync(UpdateAnnouncementCommand command, CancellationToken ct)
    {
        var reading = AnnouncementText.Read(command.Body);
        if (reading.Refusal is { } refusal)
            return Result.Validation(refusal);

        var announcement = await FindWithMentionsAsync(command.AnnouncementId, ct);
        if (announcement is null)
            return Result.NotFound(UnknownAnnouncementMessage);

        if (
            !MayChange(
                announcement.AuthorPersonId,
                command.ActorPersonId,
                command.ActorMayPostAnnouncements
            )
        )
            return Result.Forbidden(ForeignAnnouncementMessage);

        announcement.Title = command.Title;
        announcement.Body = command.Body;
        announcement.ValidUntil = command.ValidUntil;
        RewriteMentions(announcement, reading);

        return await SaveOrConflictAsync(ct);
    }

    public async Task<Result> WithdrawAsync(
        WithdrawAnnouncementCommand command,
        CancellationToken ct
    )
    {
        var announcement = await FindAsync(command.AnnouncementId, ct);
        if (announcement is null)
            return Result.NotFound(UnknownAnnouncementMessage);

        if (
            !MayChange(
                announcement.AuthorPersonId,
                command.ActorPersonId,
                command.ActorMayPostAnnouncements
            )
        )
            return Result.Forbidden(ForeignAnnouncementMessage);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        _dbContext.Announcements.Remove(announcement);
        await _dbContext.SaveChangesAsync(ct);
        await DropUndeliveredPushesAsync(announcement.Id, ct);
        await transaction.CommitAsync(ct);

        return Result.Success();
    }

    private static void RewriteMentions(Announcement announcement, RichTextReading reading)
    {
        announcement.Mentions.Clear();
        foreach (var mention in reading.Mentions)
            announcement.Mentions.Add(MentionRowOf(mention));
    }

    [Pure]
    private static AnnouncementMention MentionRowOf(Mention mention) =>
        new() { Kind = mention.Kind, TargetId = mention.TargetId };

    [Pure]
    private static bool MayChange(int? authorPersonId, int actorPersonId, bool actorMayPost) =>
        actorMayPost || authorPersonId == actorPersonId;

    private static AnnouncementSummary ToSummary(
        AnnouncementRow row,
        IReadOnlyDictionary<int, string> officeNames,
        IReadOnlyDictionary<int, AnnouncementMentionTargets> mentions,
        MediaPictures pictures
    ) =>
        new()
        {
            AnnouncementId = row.AnnouncementId,
            Title = row.Title,
            Body = row.Body,
            Mentions = mentions.GetValueOrDefault(
                row.AnnouncementId,
                AnnouncementMentionTargets.None
            ),
            PublishedAt = row.PublishedAt,
            ValidUntil = row.ValidUntil,
            Author = row.Author is { } author
                ? new AnnouncementAuthorReference
                {
                    PersonId = author.PersonId,
                    FirstName = author.FirstName,
                    LastName = author.LastName,
                    Portrait = pictures.PortraitOf(
                        author.PersonId,
                        author.PortraitId,
                        author.PortraitRenderedAt
                    ),
                    OfficeName = officeNames.GetValueOrDefault(author.PersonId),
                }
                : null,
        };

    private async Task EnqueuePostedPushesAsync(Announcement announcement, CancellationToken ct)
    {
        if (!AnnouncementPushRules.IsStillValid(announcement.ValidUntil, announcement.PublishedAt))
            return;

        var readerAccountIds = await _dbContext.PushableReaderAccountIdsAsync(
            announcement.AuthorPersonId,
            ClubClock.DayOf(announcement.PublishedAt),
            ct
        );

        _dbContext.OutboxPushes.AddRange(
            readerAccountIds.Select(accountId =>
                AnnouncementPushMessages.For(announcement, accountId)
            )
        );
        await _dbContext.SaveChangesAsync(ct);
    }

    private Task DropUndeliveredPushesAsync(int announcementId, CancellationToken ct)
    {
        var tag = AnnouncementPushMessages.TagOf(announcementId);

        return _dbContext.OutboxPushes.Where(push => push.Tag == tag).ExecuteDeleteAsync(ct);
    }

    private async Task<Result> SaveOrConflictAsync(CancellationToken ct)
    {
        try
        {
            await _dbContext.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (DbUpdateException exception) when (LostWriteRace.Caused(exception))
        {
            return Result.Conflict(WriteConflictMessages.ChangedMeanwhile);
        }
    }

    private Task<Announcement?> FindAsync(int announcementId, CancellationToken ct) =>
        _dbContext.Announcements.SingleOrDefaultAsync(row => row.Id == announcementId, ct);

    private Task<Announcement?> FindWithMentionsAsync(int announcementId, CancellationToken ct) =>
        _dbContext
            .Announcements.Include(row => row.Mentions)
            .SingleOrDefaultAsync(row => row.Id == announcementId, ct);
}
