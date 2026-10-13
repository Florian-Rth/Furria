using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Public;
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
            Street = record?.Street,
            Zip = record?.Zip,
            City = record?.City,
            Email = record?.Email,
            Phone = record?.Phone,
            WebsiteUrl = record?.WebsiteUrl,
            InstagramUrl = record?.InstagramUrl,
            FacebookUrl = record?.FacebookUrl,
            MemberCount = await MemberCountAsync(today, ct),
            GroupCount = await _publicFace.Groups.CountAsync(ct),
            AgeOfConsent = record?.AgeOfConsent ?? ClubRecord.DefaultAgeOfConsent,
            Session = await PublicSessionAsync(ClubSession.RelevantYearOf(today), ct),
        };
    }

    public async Task<IReadOnlyList<PublicBoardSeat>> GetPublicBoardAsync(CancellationToken ct)
    {
        var seats = await RunningBoardSeats.InBoardOrder(_publicFace.BoardSeats).ToListAsync(ct);

        return [.. seats.Select(ToPublicSeat)];
    }

    [Pure]
    private static PublicBoardSeat ToPublicSeat(RunningBoardSeat seat) =>
        new()
        {
            OfficeName = seat.OfficeName,
            FirstName = seat.FirstName,
            LastName = seat.LastName,
            Portrait = PublicPictures.Of(
                PublicPictureKind.BoardPortrait,
                seat.PortraitId,
                seat.PortraitRenderedAt
            ),
        };

    private Task<PublicRecordRow?> PublicRecordAsync(CancellationToken ct) =>
        _dbContext
            .ClubRecords.AsNoTracking()
            .Where(row => row.Id == ClubRecord.TheOnlyId)
            .Select(row => new PublicRecordRow(
                row.Name,
                row.FoundedYear,
                row.Street,
                row.Zip,
                row.City,
                row.Email,
                row.Phone,
                row.WebsiteUrl,
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
        string? Street,
        string? Zip,
        string? City,
        string? Email,
        string? Phone,
        string? WebsiteUrl,
        string? InstagramUrl,
        string? FacebookUrl,
        int AgeOfConsent
    );
}
