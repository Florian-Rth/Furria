using System.Diagnostics.Contracts;
using Furria.Application.Operations;
using Furria.Infrastructure.Logging;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Operations;

public sealed class SystemLogService
{
    private const string LikeEscape = "\\";

    private readonly AppDbContext _dbContext;

    public SystemLogService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<LogPageDetails> PageAsync(LogEntryQuery query, CancellationToken ct)
    {
        var page = await Filtered(query)
            .OrderByDescending(entry => entry.Id)
            .Take(query.Take + 1)
            .Select(entry => new LogEntrySummary
            {
                Id = entry.Id,
                LoggedAt = entry.LoggedAt,
                Source = entry.Source,
                Instance = entry.Instance,
                Level = entry.Level,
                Category = entry.Category,
                Template = entry.Template,
                Message = entry.Message,
                Exception = entry.Exception,
            })
            .ToListAsync(ct);

        var entries = page.Take(query.Take).ToList();
        return new LogPageDetails
        {
            Entries = entries,
            NextBefore = page.Count > query.Take ? entries[^1].Id : null,
        };
    }

    private IQueryable<LogEntry> Filtered(LogEntryQuery query)
    {
        var entries = _dbContext.LogEntries.AsNoTracking();

        if (query.Source is { } source)
            entries = entries.Where(entry => entry.Source == source);

        if (query.MinimumLevel is { } minimumLevel)
        {
            var levels = LevelsFrom(minimumLevel);
            entries = entries.Where(entry => levels.Contains(entry.Level));
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{EscapedForLike(query.Search.Trim())}%";
            entries = entries.Where(entry =>
                EF.Functions.ILike(entry.Message, pattern, LikeEscape)
                || EF.Functions.ILike(entry.Category, pattern, LikeEscape)
            );
        }

        if (query.Before is { } before)
            entries = entries.Where(entry => entry.Id < before);

        return entries;
    }

    [Pure]
    private static List<LogEntryLevel> LevelsFrom(LogEntryLevel minimumLevel) =>
        [.. Enum.GetValues<LogEntryLevel>().Where(level => level >= minimumLevel)];

    [Pure]
    private static string EscapedForLike(string text) =>
        text.Replace(LikeEscape, LikeEscape + LikeEscape, StringComparison.Ordinal)
            .Replace("%", $"{LikeEscape}%", StringComparison.Ordinal)
            .Replace("_", $"{LikeEscape}_", StringComparison.Ordinal);
}
