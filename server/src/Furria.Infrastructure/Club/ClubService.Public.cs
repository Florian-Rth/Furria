using System.Diagnostics.Contracts;
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
            Email = record?.Email,
            Phone = record?.Phone,
            InstagramUrl = record?.InstagramUrl,
            FacebookUrl = record?.FacebookUrl,
            MemberCount = await MemberCountAsync(today, ct),
            GroupCount = await GroupCountAsync(ct),
            AgeOfConsent = record?.AgeOfConsent ?? ClubRecord.DefaultAgeOfConsent,
            Session = await PublicSessionAsync(ClubSession.RelevantYearOf(today), ct),
        };
    }

    public async Task<IReadOnlyList<PublicBoardSeat>> GetPublicBoardAsync(CancellationToken ct)
    {
        var seats = await _runningBoardSeats.SeatsAsync(ClubClock.Today(_timeProvider), ct);

        return [.. seats.Where(seat => seat.OfficeIsPublic).Select(ToPublicSeat)];
    }

    [Pure]
    private static PublicBoardSeat ToPublicSeat(RunningBoardSeat seat) =>
        new()
        {
            OfficeName = seat.OfficeName,
            FirstName = seat.FirstName,
            LastName = seat.LastName,
            PortraitUrl = seat.PortraitUrl,
        };

    private Task<PublicRecordRow?> PublicRecordAsync(CancellationToken ct) =>
        _dbContext
            .ClubRecords.AsNoTracking()
            .Where(row => row.Id == ClubRecord.TheOnlyId)
            .Select(row => new PublicRecordRow(
                row.Name,
                row.FoundedYear,
                row.Email,
                row.Phone,
                row.InstagramUrl,
                row.FacebookUrl,
                row.AgeOfConsent
            ))
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

    private sealed record PublicRecordRow(
        string? Name,
        int? FoundedYear,
        string? Email,
        string? Phone,
        string? InstagramUrl,
        string? FacebookUrl,
        int AgeOfConsent
    );
}
