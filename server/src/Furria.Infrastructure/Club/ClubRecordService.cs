using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class ClubRecordService
{
    private const string FutureFoundedYearMessage = "Das Gründungsjahr liegt in der Zukunft.";

    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public ClubRecordService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<ClubRecordDetails> GetAsync(CancellationToken ct)
    {
        var record = await _dbContext
            .ClubRecords.AsNoTracking()
            .SingleOrDefaultAsync(row => row.Id == ClubRecord.TheOnlyId, ct);

        return ToDetails(record ?? new ClubRecord());
    }

    public async Task<Result> UpdateIdentityAsync(
        UpdateClubIdentityCommand command,
        CancellationToken ct
    )
    {
        if (IsInTheFuture(command.FoundedYear, ClubClock.Today(_timeProvider)))
            return Result.Validation(FutureFoundedYearMessage);

        var record = await TrackedRecordAsync(ct);
        record.Name = Written(command.Name);
        record.ShortName = Written(command.ShortName);
        record.FoundedYear = command.FoundedYear;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> UpdateContactAsync(
        UpdateClubContactCommand command,
        CancellationToken ct
    )
    {
        var record = await TrackedRecordAsync(ct);
        record.Street = Written(command.Street);
        record.Zip = Written(command.Zip);
        record.City = Written(command.City);
        record.Email = Written(command.Email);
        record.Phone = Written(command.Phone);
        record.WebsiteUrl = Written(command.WebsiteUrl);
        record.InstagramUrl = Written(command.InstagramUrl);
        record.FacebookUrl = Written(command.FacebookUrl);

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    public async Task<Result> UpdateAccessAsync(int ageOfConsent, CancellationToken ct)
    {
        var record = await TrackedRecordAsync(ct);
        record.AgeOfConsent = ageOfConsent;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    private async Task<ClubRecord> TrackedRecordAsync(CancellationToken ct)
    {
        var existing = await _dbContext.ClubRecords.SingleOrDefaultAsync(
            row => row.Id == ClubRecord.TheOnlyId,
            ct
        );
        if (existing is not null)
            return existing;

        var created = new ClubRecord();
        _dbContext.ClubRecords.Add(created);

        return created;
    }

    [Pure]
    private static bool IsInTheFuture(int? foundedYear, DateOnly today) =>
        foundedYear is { } year && year > today.Year;

    [Pure]
    private static string? Written(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    [Pure]
    private static ClubRecordDetails ToDetails(ClubRecord record) =>
        new()
        {
            Name = record.Name,
            ShortName = record.ShortName,
            FoundedYear = record.FoundedYear,
            Street = record.Street,
            Zip = record.Zip,
            City = record.City,
            Email = record.Email,
            Phone = record.Phone,
            WebsiteUrl = record.WebsiteUrl,
            InstagramUrl = record.InstagramUrl,
            FacebookUrl = record.FacebookUrl,
            AgeOfConsent = record.AgeOfConsent,
        };
}
