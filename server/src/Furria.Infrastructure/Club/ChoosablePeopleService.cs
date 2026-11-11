using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Application.Results;
using Furria.Core.Club;
using Furria.Core.Ties;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed class ChoosablePeopleService
{
    private const string MayScheduleNothingMessage = "Du kannst keine Kalendereinträge anlegen.";

    private static readonly string[] SchedulingKeys =
    [
        FurriaPermissions.CalendarManageClub,
        FurriaPermissions.GroupsManage,
    ];

    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public ChoosablePeopleService(
        AppDbContext dbContext,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
    }

    public async Task<Result<IReadOnlyList<ChoosablePersonSummary>>> GetChoosablePeopleAsync(
        int actorAccountId,
        CancellationToken ct
    )
    {
        if (!await MayScheduleAnythingAsync(actorAccountId, ct))
            return Result<IReadOnlyList<ChoosablePersonSummary>>.Forbidden(
                MayScheduleNothingMessage
            );

        var today = ClubClock.Today(_timeProvider);
        var choosableIds = _dbContext.ChoosablePersonIds(today);
        var groupMemberships = _dbContext.GroupMemberships.Where(
            Conferring.GroupMemberships(today)
        );

        return Result<IReadOnlyList<ChoosablePersonSummary>>.Success(
            await _dbContext
                .People.AsNoTracking()
                .Where(person => choosableIds.Contains(person.Id))
                .OrderBy(person => EF.Functions.Collate(person.FirstName, GermanCollation.Name))
                .ThenBy(person => EF.Functions.Collate(person.LastName, GermanCollation.Name))
                .ThenBy(person => person.Id)
                .Select(person => new ChoosablePersonSummary
                {
                    PersonId = person.Id,
                    FirstName = person.FirstName,
                    LastName = person.LastName,
                    GroupIds = groupMemberships
                        .Where(membership => membership.PersonId == person.Id)
                        .Select(membership => membership.GroupId)
                        .Distinct()
                        .ToList(),
                })
                .ToListAsync(ct)
        );
    }

    private async Task<bool> MayScheduleAnythingAsync(int actorAccountId, CancellationToken ct) =>
        await _authorizer.IsGrantedAnyAsync(actorAccountId, SchedulingKeys, ct)
        || (await _authorizer.AdministeredGroupIdsAsync(actorAccountId, ct)).Count > 0;
}
