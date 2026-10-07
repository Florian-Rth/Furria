using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Management;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly RunningBoardSeats _runningBoardSeats;
    private readonly ToDoService _toDoService;
    private readonly TimeProvider _timeProvider;

    public StartService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        RunningBoardSeats runningBoardSeats,
        ToDoService toDoService,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _runningBoardSeats = runningBoardSeats;
        _toDoService = toDoService;
        _timeProvider = timeProvider;
    }

    public async Task<StartDetails> GetAsync(int accountId, int? personId, CancellationToken ct)
    {
        var moment = StartMoment.Of(_timeProvider);

        return personId is { } viewerPersonId
            ? await PersonsStartAsync(accountId, viewerPersonId, moment, ct)
            : StartComposer.Compose(
                StartCandidates.OnlyToDos(await _toDoService.ForAsync(accountId, ct)),
                moment
            );
    }

    private async Task<StartDetails> PersonsStartAsync(
        int accountId,
        int personId,
        StartMoment moment,
        CancellationToken ct
    )
    {
        if (!await IsActiveInClubAsync(personId, moment.Today, ct))
            return StartComposer.Inactive(moment);

        var viewer = await ViewerAsync(accountId, personId, moment, ct);

        return StartComposer.Compose(
            new StartCandidates
            {
                Entries = await EntryCandidatesAsync(viewer, ct),
                Announcements = await AnnouncementCandidatesAsync(viewer, ct),
                ToDos = await _toDoService.ForAsync(accountId, ct),
                Mine = await MineCandidatesAsync(viewer, ct),
                GroupMoments = await GroupMomentCandidatesAsync(viewer, ct),
            },
            moment
        );
    }

    private Task<bool> IsActiveInClubAsync(int personId, DateOnly today, CancellationToken ct) =>
        _dbContext
            .People.AsNoTracking()
            .Where(person => person.Id == personId)
            .AnyAsync(_dbContext.IsActiveInClubOn(today), ct);

    private async Task<Viewer> ViewerAsync(
        int accountId,
        int personId,
        StartMoment moment,
        CancellationToken ct
    ) =>
        new(
            personId,
            moment,
            await _dbContext.CalendarTiesOfAsync(personId, moment.Today, ct),
            (await _authorizer.GrantedKeysAsync(accountId, ct)).ToHashSet(StringComparer.Ordinal),
            await LastSeenAnnouncementAtAsync(accountId, ct),
            await KeyVenueIdsAsync(personId, moment.Today, ct)
        );

    private Task<DateTimeOffset?> LastSeenAnnouncementAtAsync(
        int accountId,
        CancellationToken ct
    ) =>
        _dbContext
            .Users.AsNoTracking()
            .Where(account => account.Id == accountId)
            .Select(account => account.LastSeenAnnouncementAt)
            .SingleOrDefaultAsync(ct);

    private async Task<IReadOnlySet<int>> KeyVenueIdsAsync(
        int personId,
        DateOnly today,
        CancellationToken ct
    ) =>
        (
            await _dbContext
                .KeyHoldings.AsNoTracking()
                .Where(holding =>
                    holding.PersonId == personId
                    && holding.SinceOn <= today
                    && (holding.UntilOn == null || holding.UntilOn >= today)
                )
                .Select(holding => holding.VenueId)
                .ToListAsync(ct)
        ).ToHashSet();

    private sealed record Viewer(
        int PersonId,
        StartMoment Moment,
        CalendarTies Ties,
        IReadOnlySet<string> GrantedKeys,
        DateTimeOffset? LastSeenAnnouncementAt,
        IReadOnlySet<int> KeyVenueIds
    );
}
