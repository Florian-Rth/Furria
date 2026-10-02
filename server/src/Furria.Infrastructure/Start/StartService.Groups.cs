using System.Diagnostics.Contracts;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    [Pure]
    private static StartGroupMoment? JubileeOf(JubileeGroupRow group, int sessionYear) =>
        Anniversary.GroupJubileeYears(group.FoundedYear, sessionYear) is { } years
            ? new StartGroupMoment
            {
                Kind = StartGroupMomentKind.Jubilee,
                GroupId = group.GroupId,
                Name = group.Name,
                Tone = group.Tone,
                Years = years,
                FoundedYear = group.FoundedYear,
                Until = FortnightEndOf(ClubSession.OpeningOf(sessionYear)),
            }
            : null;

    private async Task<IReadOnlyList<StartGroupMoment>> GroupMomentCandidatesAsync(
        Viewer viewer,
        CancellationToken ct
    )
    {
        var sessionYear = ClubSession.YearOf(viewer.Moment.Today);

        if (viewer.Moment.Today > FortnightEndOf(ClubSession.OpeningOf(sessionYear)))
            return [];

        var groups = await FoundedTieGroupsAsync(viewer.Ties, ct);

        return
        [
            .. groups.Select(group => JubileeOf(group, sessionYear)).OfType<StartGroupMoment>(),
        ];
    }

    private Task<List<JubileeGroupRow>> FoundedTieGroupsAsync(
        CalendarTies ties,
        CancellationToken ct
    )
    {
        var tieGroupIds = TieGroupIdsOf(ties);

        return _dbContext
            .Groups.AsNoTracking()
            .Where(group =>
                tieGroupIds.Contains(group.Id)
                && group.ArchivedOn == null
                && group.FoundedYear != null
            )
            .Select(group => new JubileeGroupRow(
                group.Id,
                group.Name,
                group.Tone,
                group.FoundedYear!.Value
            ))
            .ToListAsync(ct);
    }

    private sealed record JubileeGroupRow(
        int GroupId,
        string Name,
        GroupTone? Tone,
        int FoundedYear
    );
}
