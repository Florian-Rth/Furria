using System.Diagnostics.Contracts;
using Furria.Application.Identity;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    private const int FortnightDays = 14;
    private const int ContactChangeReachDays = 14;
    private const int MonthDays = 30;

    [Pure]
    private static DateOnly FortnightEndOf(DateOnly firstDay) =>
        firstDay.AddDays(FortnightDays - 1);

    [Pure]
    private static DateOnly FreshSinceOf(DateOnly today) => today.AddDays(1 - FortnightDays);

    [Pure]
    private static StartMineSummary MineItemOf(
        StartMineKind kind,
        int? subjectId,
        DateOnly on,
        DateOnly until
    ) =>
        new()
        {
            Kind = kind,
            SubjectId = subjectId,
            On = on,
            Until = until,
            Name = null,
            GroupTone = null,
            Function = null,
            ChangedBy = null,
            SessionStartYear = null,
            Years = null,
            PermissionKeys = null,
        };

    [Pure]
    private static StartMineSummary NewTieOf(StartMineKind kind, NewTieRow row) =>
        MineItemOf(kind, row.SubjectId, row.SinceOn, FortnightEndOf(row.SinceOn)) with
        {
            Name = row.Name,
            GroupTone = row.Tone,
            Function = row.Function,
            PermissionKeys = row.PermissionKeys is null
                ? null
                : [.. row.PermissionKeys.Order(StringComparer.Ordinal)],
        };

    [Pure]
    private static StartMineSummary ContactChangeOf(ContactChangeRow row)
    {
        var on = ClubClock.DayOf(row.ChangedAt);

        return MineItemOf(
            StartMineKind.ContactChangedByOther,
            null,
            on,
            on.AddDays(ContactChangeReachDays)
        ) with
        {
            ChangedBy = new StartPersonRef
            {
                PersonId = row.ChangedByPersonId,
                FirstName = row.ChangedByFirstName,
                LastName = row.ChangedByLastName,
            },
        };
    }

    [Pure]
    private static IEnumerable<StartMineSummary> MembershipNewsOf(
        MembershipChainDetails chain,
        DateOnly today
    ) =>
        new[]
        {
            MembershipEndingOf(chain, today),
            MembershipPausedOf(chain, today),
            MilestoneOf(chain, today),
        }.OfType<StartMineSummary>();

    [Pure]
    private static StartMineSummary? MembershipEndingOf(
        MembershipChainDetails chain,
        DateOnly today
    )
    {
        if (chain.Current?.EndedOn is not { } endedOn || endedOn > today.AddDays(MonthDays))
            return null;

        var dayAfter = endedOn.AddDays(1);

        return chain.All.Any(period => period.ToPeriod().IsRunningOn(dayAfter))
            ? null
            : MineItemOf(StartMineKind.MembershipEnding, null, endedOn, endedOn);
    }

    [Pure]
    private static StartMineSummary? MembershipPausedOf(
        MembershipChainDetails chain,
        DateOnly today
    )
    {
        if (PauseNoticeSessionOf(today) is not { } sessionYear)
            return null;

        var opening = ClubSession.OpeningOf(sessionYear);
        var isPaused = chain.All.Any(period =>
            period.ToPeriod().IsRunningOn(opening)
            && period.Pauses.Any(pause => pause.ToSpan().Contains(sessionYear))
        );

        return isPaused
            ? MineItemOf(
                StartMineKind.MembershipPaused,
                null,
                opening,
                FortnightEndOf(opening)
            ) with
            {
                SessionStartYear = sessionYear,
            }
            : null;
    }

    [Pure]
    private static int? PauseNoticeSessionOf(DateOnly today)
    {
        var runningYear = ClubSession.YearOf(today);

        if (today <= FortnightEndOf(ClubSession.OpeningOf(runningYear)))
            return runningYear;

        var nextYear = runningYear + 1;

        return today >= ClubSession.OpeningOf(nextYear).AddDays(-MonthDays) ? nextYear : null;
    }

    [Pure]
    private static StartMineSummary? MilestoneOf(MembershipChainDetails chain, DateOnly today)
    {
        if (
            chain.State is not (MembershipState.Active or MembershipState.Paused)
            || chain.MemberSince is not { } memberSince
        )
            return null;

        var day = LastAnniversaryBefore(memberSince, today);
        var years = Anniversary.YearsOn(memberSince, day);

        return Anniversary.IsRound(years) && today <= day.AddDays(MonthDays)
            ? MineItemOf(StartMineKind.Milestone, null, day, day.AddDays(MonthDays)) with
            {
                Years = years,
            }
            : null;
    }

    [Pure]
    private static DateOnly LastAnniversaryBefore(DateOnly origin, DateOnly today)
    {
        var thisYearsAnniversary = Anniversary.DayIn(origin, today.Year);

        return thisYearsAnniversary < today
            ? thisYearsAnniversary
            : Anniversary.DayIn(origin, today.Year - 1);
    }

    [Pure]
    private static MembershipChainDetails ChainOf(
        IReadOnlyList<MembershipRow> rows,
        DateOnly today
    ) =>
        MembershipChainDetails.Of(
            [
                .. rows.Select(row =>
                    MembershipDetails.Of(row.Id, row.StartedOn, row.EndedOn, row.Pauses, today)
                ),
            ],
            today
        );

    private async Task<IReadOnlyList<StartMineSummary>> MineCandidatesAsync(
        Viewer viewer,
        CancellationToken ct
    ) =>
        [
            .. (await NewRolesAsync(viewer, ct)).Select(row =>
                NewTieOf(StartMineKind.NewRole, row)
            ),
            .. (await NewBoardSeatsAsync(viewer, ct)).Select(row =>
                NewTieOf(StartMineKind.NewBoardSeat, row)
            ),
            .. (await NewGroupAdminTenuresAsync(viewer, ct)).Select(row =>
                NewTieOf(StartMineKind.NewGroupAdmin, row)
            ),
            .. (await NewGroupMembershipsAsync(viewer, ct)).Select(row =>
                NewTieOf(StartMineKind.NewGroupMembership, row)
            ),
            .. (await NewKeysAsync(viewer, ct)).Select(row => NewTieOf(StartMineKind.NewKey, row)),
            .. (await ContactChangesByOthersAsync(viewer, ct)).Select(ContactChangeOf),
            .. MembershipNewsOf(
                ChainOf(await MembershipRowsAsync(viewer.PersonId, ct), viewer.Moment.Today),
                viewer.Moment.Today
            ),
        ];

    private Task<List<NewTieRow>> NewRolesAsync(Viewer viewer, CancellationToken ct)
    {
        var personId = viewer.PersonId;
        var today = viewer.Moment.Today;
        var freshSince = FreshSinceOf(today);

        return _dbContext
            .RoleHoldings.AsNoTracking()
            .Where(holding =>
                holding.PersonId == personId
                && holding.SinceOn >= freshSince
                && holding.SinceOn <= today
                && (holding.UntilOn == null || holding.UntilOn >= today)
                && holding.Role!.ArchivedOn == null
            )
            .Select(holding => new NewTieRow(
                holding.RoleId,
                holding.SinceOn,
                holding.Role!.Name,
                null,
                null,
                holding.Role.Permissions.Select(permission => permission.PermissionKey).ToList()
            ))
            .ToListAsync(ct);
    }

    private Task<List<NewTieRow>> NewBoardSeatsAsync(Viewer viewer, CancellationToken ct)
    {
        var personId = viewer.PersonId;
        var today = viewer.Moment.Today;
        var freshSince = FreshSinceOf(today);

        return _dbContext
            .BoardSeats.AsNoTracking()
            .Where(seat =>
                seat.PersonId == personId
                && seat.SinceOn >= freshSince
                && seat.SinceOn <= today
                && (seat.UntilOn == null || seat.UntilOn >= today)
                && seat.BoardOffice!.ArchivedOn == null
            )
            .Select(seat => new NewTieRow(
                seat.BoardOfficeId,
                seat.SinceOn,
                seat.BoardOffice!.Name,
                null,
                null,
                _dbContext
                    .RolePermissions.Where(permission =>
                        permission.RoleId == seat.BoardOffice.ImpliedRoleId
                        && permission.Role!.ArchivedOn == null
                    )
                    .Select(permission => permission.PermissionKey)
                    .ToList()
            ))
            .ToListAsync(ct);
    }

    private Task<List<NewTieRow>> NewGroupAdminTenuresAsync(Viewer viewer, CancellationToken ct)
    {
        var personId = viewer.PersonId;
        var today = viewer.Moment.Today;
        var freshSince = FreshSinceOf(today);

        return _dbContext
            .GroupAdmins.AsNoTracking()
            .Where(tenure =>
                tenure.PersonId == personId
                && tenure.SinceOn >= freshSince
                && tenure.SinceOn <= today
                && (tenure.UntilOn == null || tenure.UntilOn >= today)
                && tenure.Group!.ArchivedOn == null
            )
            .Select(tenure => new NewTieRow(
                tenure.GroupId,
                tenure.SinceOn,
                tenure.Group!.Name,
                tenure.Group.Tone,
                tenure.Function,
                null
            ))
            .ToListAsync(ct);
    }

    private Task<List<NewTieRow>> NewGroupMembershipsAsync(Viewer viewer, CancellationToken ct)
    {
        var personId = viewer.PersonId;
        var today = viewer.Moment.Today;
        var freshSince = FreshSinceOf(today);

        return _dbContext
            .GroupMemberships.AsNoTracking()
            .Where(membership =>
                membership.PersonId == personId
                && membership.JoinedOn >= freshSince
                && membership.JoinedOn <= today
                && (membership.LeftOn == null || membership.LeftOn >= today)
                && membership.Group!.ArchivedOn == null
            )
            .Select(membership => new NewTieRow(
                membership.GroupId,
                membership.JoinedOn,
                membership.Group!.Name,
                membership.Group.Tone,
                null,
                null
            ))
            .ToListAsync(ct);
    }

    private Task<List<NewTieRow>> NewKeysAsync(Viewer viewer, CancellationToken ct)
    {
        var personId = viewer.PersonId;
        var today = viewer.Moment.Today;
        var freshSince = FreshSinceOf(today);

        return _dbContext
            .KeyHoldings.AsNoTracking()
            .Where(holding =>
                holding.PersonId == personId
                && holding.SinceOn >= freshSince
                && holding.SinceOn <= today
                && (holding.UntilOn == null || holding.UntilOn >= today)
                && holding.Venue!.ArchivedOn == null
            )
            .Select(holding => new NewTieRow(
                holding.VenueId,
                holding.SinceOn,
                holding.Venue!.Name,
                null,
                null,
                null
            ))
            .ToListAsync(ct);
    }

    private Task<List<ContactChangeRow>> ContactChangesByOthersAsync(
        Viewer viewer,
        CancellationToken ct
    )
    {
        var personId = viewer.PersonId;
        var changedSince = ClubClock.StartOfDay(
            viewer.Moment.Today.AddDays(-ContactChangeReachDays)
        );

        return _dbContext
            .People.AsNoTracking()
            .Where(person =>
                person.Id == personId
                && person.ContactChangedAt >= changedSince
                && person.ContactChangedBy != null
                && person.ContactChangedBy.Id != personId
            )
            .Select(person => new ContactChangeRow(
                person.ContactChangedAt!.Value,
                person.ContactChangedBy!.Id,
                person.ContactChangedBy.FirstName,
                person.ContactChangedBy.LastName
            ))
            .ToListAsync(ct);
    }

    private Task<List<MembershipRow>> MembershipRowsAsync(int personId, CancellationToken ct) =>
        _dbContext
            .Memberships.AsNoTracking()
            .Where(membership => membership.PersonId == personId)
            .Select(membership => new MembershipRow(
                membership.Id,
                membership.StartedOn,
                membership.EndedOn,
                membership
                    .Pauses.Select(pause => new MembershipPauseDetails
                    {
                        PauseId = pause.Id,
                        FirstSessionYear = pause.FirstSessionYear,
                        LastSessionYear = pause.LastSessionYear,
                    })
                    .ToList()
            ))
            .ToListAsync(ct);

    private sealed record NewTieRow(
        int SubjectId,
        DateOnly SinceOn,
        string Name,
        GroupTone? Tone,
        string? Function,
        IReadOnlyList<string>? PermissionKeys
    );

    private sealed record ContactChangeRow(
        DateTimeOffset ChangedAt,
        int ChangedByPersonId,
        string ChangedByFirstName,
        string ChangedByLastName
    );

    private sealed record MembershipRow(
        int Id,
        DateOnly StartedOn,
        DateOnly? EndedOn,
        IReadOnlyList<MembershipPauseDetails> Pauses
    );
}
