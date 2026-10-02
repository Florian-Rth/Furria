using Furria.Application.Club;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    public async Task<PublicClubDetails> GetPublicAsync(CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);
        var record = await PublicRecordAsync(ct);

        return new PublicClubDetails
        {
            Name = record?.Name,
            FoundedYear = record?.FoundedYear,
            MemberCount = await MemberCountAsync(today, ct),
            GroupCount = await GroupCountAsync(ct),
            Session = await PublicSessionAsync(ClubSession.RelevantYearOf(today), ct),
        };
    }

    private Task<PublicRecordRow?> PublicRecordAsync(CancellationToken ct) =>
        _dbContext
            .ClubRecords.AsNoTracking()
            .Where(row => row.Id == ClubRecord.TheOnlyId)
            .Select(row => new PublicRecordRow(row.Name, row.FoundedYear))
            .SingleOrDefaultAsync(ct);

    private async Task<PublicClubSession> PublicSessionAsync(int startYear, CancellationToken ct)
    {
        var motto = await _dbContext
            .Sessions.AsNoTracking()
            .Where(session => session.StartYear == startYear)
            .Select(session => session.Motto)
            .SingleOrDefaultAsync(ct);

        return new PublicClubSession
        {
            StartYear = startYear,
            Label = ClubSession.LabelOf(startYear),
            Motto = motto,
        };
    }

    private sealed record PublicRecordRow(string? Name, int? FoundedYear);
}
