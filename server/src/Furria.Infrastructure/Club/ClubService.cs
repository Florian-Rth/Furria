using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class ClubService
{
    private readonly AppDbContext _dbContext;
    private readonly RunningBoardSeats _runningBoardSeats;
    private readonly TimeProvider _timeProvider;

    public ClubService(
        AppDbContext dbContext,
        RunningBoardSeats runningBoardSeats,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _runningBoardSeats = runningBoardSeats;
        _timeProvider = timeProvider;
    }

    public async Task<ClubHubDetails> GetHubAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var today = ClubClock.Today(_timeProvider);
        var startYear = ClubSession.RelevantYearOf(today);

        return new ClubHubDetails
        {
            Session = await SessionAsync(startYear, ct),
            Stats = await StatsAsync(today, ct),
            Announcements = await AnnouncementsAsync(today, ct),
            Calendar = await CalendarAsync(now, ct),
            Board = await BoardAsync(today, ct),
            Venues = await VenuesAsync(today, ct),
        };
    }

    private async Task<ClubHubSession> SessionAsync(int startYear, CancellationToken ct)
    {
        var recorded = await _dbContext
            .Sessions.AsNoTracking()
            .Where(session => session.StartYear == startYear)
            .Select(session => new SessionRow(session.Number, session.Motto, session.LogoSvg))
            .SingleOrDefaultAsync(ct);

        return new ClubHubSession
        {
            StartYear = startYear,
            Label = ClubSession.LabelOf(startYear),
            Number = recorded?.Number,
            Motto = recorded?.Motto,
            LogoSvg = recorded?.LogoSvg,
        };
    }

    private async Task<ClubHubStats> StatsAsync(DateOnly today, CancellationToken ct)
    {
        var opening = ClubSession.OpeningOf(ClubSession.YearOf(today));

        var memberCount = await _dbContext.People.CountAsync(
            person =>
                person.Memberships.Any(membership =>
                    membership.StartedOn <= today
                    && (membership.EndedOn == null || membership.EndedOn >= today)
                ),
            ct
        );

        var groupCount = await _dbContext.Groups.CountAsync(group => group.ArchivedOn == null, ct);

        var joinedThisSessionCount = await _dbContext.People.CountAsync(
            person =>
                person.Memberships.Any(membership =>
                    membership.StartedOn >= opening && membership.StartedOn <= today
                ),
            ct
        );

        return new ClubHubStats
        {
            MemberCount = memberCount,
            GroupCount = groupCount,
            JoinedThisSessionCount = joinedThisSessionCount,
        };
    }

    private sealed record SessionRow(int? Number, string? Motto, string? LogoSvg);
}
