using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class SessionRecordService
{
    private const int NoSessionId = 0;
    private const string UnknownRecordMessage = "Diesen Sessionseintrag gibt es nicht.";
    private const string DuplicateStartYearMessage =
        "Für diese Session gibt es schon einen Eintrag.";
    private const string DuplicateNumberMessage = "Diese Nº steht schon bei einer anderen Session.";

    private readonly AppDbContext _dbContext;
    private readonly MediaPictures _pictures;
    private readonly TimeProvider _timeProvider;

    public SessionRecordService(
        AppDbContext dbContext,
        MediaPictures pictures,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _pictures = pictures;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<SessionRecordSummary>> GetRecordsAsync(CancellationToken ct)
    {
        var rows = await _dbContext
            .Sessions.AsNoTracking()
            .OrderByDescending(session => session.StartYear)
            .Select(session => new RecordRow(
                session.Id,
                session.StartYear,
                session.Number,
                session.Motto,
                session.Logo == null
                    ? null
                    : new SessionLogoRow(
                        session.Id,
                        session.Logo.Id,
                        session.Logo.State,
                        session.Logo.RenderedAt,
                        session.Logo.Width,
                        session.Logo.Height
                    )
            ))
            .ToListAsync(ct);
        var stalledIds = await _dbContext.StalledAmongAsync(
            rows.Select(row => row.Logo is { } logo ? SessionLogos.PictureRowOf(logo) : null),
            _timeProvider.GetUtcNow(),
            ct
        );

        return [.. rows.Select(row => SummaryOf(row, stalledIds))];
    }

    public async Task<Result<int>> CreateAsync(
        CreateSessionRecordCommand command,
        CancellationToken ct
    )
    {
        if (await StartYearIsTakenAsync(command.StartYear, NoSessionId, ct))
            return Result<int>.Conflict(DuplicateStartYearMessage);

        if (await NumberIsTakenAsync(command.Number, NoSessionId, ct))
            return Result<int>.Conflict(DuplicateNumberMessage);

        var session = new Session
        {
            StartYear = command.StartYear,
            Number = command.Number,
            Motto = Written(command.Motto),
        };

        _dbContext.Sessions.Add(session);

        var saved = await _dbContext.SaveOrConflictAsync(ct);
        if (!saved.IsSuccess)
            return Result<int>.Conflict(saved.Error.Message);

        return Result<int>.Success(session.Id);
    }

    public async Task<Result> UpdateAsync(UpdateSessionRecordCommand command, CancellationToken ct)
    {
        var session = await TrackedRecordAsync(command.SessionId, ct);

        if (session is null)
            return Result.NotFound(UnknownRecordMessage);

        if (await StartYearIsTakenAsync(command.StartYear, command.SessionId, ct))
            return Result.Conflict(DuplicateStartYearMessage);

        if (await NumberIsTakenAsync(command.Number, command.SessionId, ct))
            return Result.Conflict(DuplicateNumberMessage);

        session.StartYear = command.StartYear;
        session.Number = command.Number;
        session.Motto = Written(command.Motto);

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> DeleteAsync(int sessionId, CancellationToken ct)
    {
        var session = await TrackedRecordAsync(sessionId, ct);

        if (session is null)
            return Result.NotFound(UnknownRecordMessage);

        _dbContext.Sessions.Remove(session);
        await _dbContext.SaveChangesAsync(ct);

        return Result.Success();
    }

    private Task<Session?> TrackedRecordAsync(int sessionId, CancellationToken ct) =>
        _dbContext.Sessions.SingleOrDefaultAsync(session => session.Id == sessionId, ct);

    private Task<bool> StartYearIsTakenAsync(
        int startYear,
        int exceptSessionId,
        CancellationToken ct
    ) =>
        _dbContext.Sessions.AnyAsync(
            session => session.StartYear == startYear && session.Id != exceptSessionId,
            ct
        );

    private Task<bool> NumberIsTakenAsync(int? number, int exceptSessionId, CancellationToken ct) =>
        number is null
            ? Task.FromResult(false)
            : _dbContext.Sessions.AnyAsync(
                session => session.Number == number && session.Id != exceptSessionId,
                ct
            );

    private SessionRecordSummary SummaryOf(RecordRow row, IReadOnlySet<int> stalledIds) =>
        new()
        {
            SessionId = row.SessionId,
            StartYear = row.StartYear,
            Number = row.Number,
            Motto = row.Motto,
            Logo = row.Logo is { } logo
                ? SessionLogos.EditingOf(_pictures, logo, stalledIds)
                : null,
        };

    [Pure]
    private static string? Written(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed record RecordRow(
        int SessionId,
        int StartYear,
        int? Number,
        string? Motto,
        SessionLogoRow? Logo
    );
}
