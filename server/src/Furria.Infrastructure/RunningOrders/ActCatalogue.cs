using System.Diagnostics.Contracts;
using System.Linq.Expressions;
using Furria.Application.Media;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.RunningOrders;

public sealed class ActCatalogue
{
    private readonly AppDbContext _dbContext;
    private readonly PictureLookup _pictures;
    private readonly TimeProvider _timeProvider;

    public ActCatalogue(AppDbContext dbContext, PictureLookup pictures, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _pictures = pictures;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<ActSummary>> ActsOnAsync(
        Expression<Func<Act, bool>> filter,
        DateOnly day,
        CancellationToken ct
    )
    {
        var acts = await _dbContext
            .Acts.AsNoTracking()
            .Where(filter)
            .OrderBy(act => act.Name)
            .ThenBy(act => act.Id)
            .Select(act => new ActRow(
                act.Id,
                act.Name,
                act.Kind,
                act.SessionYear,
                act.ArchivedAt != null,
                act.GroupId,
                act.Group == null ? null : act.Group.Name,
                act.Group == null ? null : act.Group.Tone,
                act.Group == null ? null : act.Group.Icon,
                act.CastChanges.Select(change => new ChangeRow(change.PersonId, change.Change))
                    .ToList(),
                act.CastFrozenAt != null,
                act.FrozenCast.Select(member => member.PersonId).ToList(),
                act.Wishes.Select(wish => new ActWishDetails
                    {
                        ActWishId = wish.Id,
                        ActId = wish.ActId,
                        Kind = wish.Kind,
                        Strength = wish.Strength,
                    })
                    .ToList()
            ))
            .ToListAsync(ct);

        var groupIds = acts.Where(act => act.GroupId is not null)
            .Select(act => act.GroupId!.Value)
            .ToHashSet();
        var memberships = await MembershipsOfAsync(groupIds, ct);
        var today = ClubClock.Today(_timeProvider);
        var casts = acts.ToDictionary(
            act => act.ActId,
            act => CastOf(act, memberships, CastDayOf(act, day, today))
        );
        var personIds = casts
            .Values.SelectMany(cast => cast)
            .Concat(acts.SelectMany(act => act.Changes.Select(change => change.PersonId)))
            .ToHashSet();
        var persons = await PersonsInNameOrderAsync(personIds, ct);
        var groupPictures = await _pictures.GroupPicturesOfAsync(groupIds, ct);

        return
        [
            .. acts.Select(act =>
                SummaryOf(
                    act,
                    casts[act.ActId],
                    persons,
                    groupPictures.GetValueOrDefault(act.GroupId ?? 0),
                    today
                )
            ),
        ];
    }

    [Pure]
    private static ActSummary SummaryOf(
        ActRow act,
        IReadOnlySet<int> cast,
        IReadOnlyList<CastMember> persons,
        PictureDetails? groupPicture,
        DateOnly today
    )
    {
        var added = PersonsChanged(act, CastChange.Added);
        var removed = PersonsChanged(act, CastChange.Removed);

        return new ActSummary
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            SessionYear = act.SessionYear,
            IsClosed = ActSession.IsClosed(act.SessionYear, today),
            IsArchived = act.IsArchived,
            Group = act.GroupId is { } id
                ? new ActGroupReference
                {
                    GroupId = id,
                    Name = act.GroupName!,
                    Tone = act.GroupTone,
                    Icon = act.GroupIcon,
                    Picture = groupPicture,
                }
                : null,
            Cast = InNameOrder(cast, persons),
            Added = InNameOrder(added, persons),
            Removed = InNameOrder(removed, persons),
            Wishes = [.. act.Wishes.OrderBy(wish => wish.Kind)],
        };
    }

    [Pure]
    private static DateOnly CastDayOf(ActRow act, DateOnly day, DateOnly today) =>
        act.SessionYear is { } sessionYear && ActSession.IsClosed(sessionYear, today)
            ? Earlier(day, ActSession.CastFreezeDayOf(sessionYear))
            : day;

    [Pure]
    private static DateOnly Earlier(DateOnly day, DateOnly other) => day < other ? day : other;

    [Pure]
    private static IReadOnlySet<int> CastOf(
        ActRow act,
        IReadOnlyList<MembershipRow> memberships,
        DateOnly castDay
    )
    {
        if (act.IsCastFrozen)
            return act.FrozenCast.ToHashSet();

        var groupMembers = memberships
            .Where(membership => membership.GroupId == act.GroupId && membership.HeldOn(castDay))
            .Select(membership => membership.PersonId);

        return groupMembers
            .Concat(PersonsChanged(act, CastChange.Added))
            .Except(PersonsChanged(act, CastChange.Removed))
            .ToHashSet();
    }

    [Pure]
    private static IReadOnlySet<int> PersonsChanged(ActRow act, CastChange change) =>
        act.Changes.Where(row => row.Change == change).Select(row => row.PersonId).ToHashSet();

    [Pure]
    private static IReadOnlyList<CastMember> InNameOrder(
        IEnumerable<int> personIds,
        IReadOnlyList<CastMember> persons
    )
    {
        var wanted = personIds.ToHashSet();

        return [.. persons.Where(person => wanted.Contains(person.PersonId))];
    }

    private async Task<IReadOnlyList<MembershipRow>> MembershipsOfAsync(
        IReadOnlyCollection<int> groupIds,
        CancellationToken ct
    )
    {
        if (groupIds.Count == 0)
            return [];

        return await _dbContext
            .GroupMemberships.AsNoTracking()
            .Where(membership => groupIds.Contains(membership.GroupId))
            .Select(membership => new MembershipRow(
                membership.GroupId,
                membership.PersonId,
                membership.JoinedOn,
                membership.LeftOn
            ))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<CastMember>> PersonsInNameOrderAsync(
        IReadOnlyCollection<int> personIds,
        CancellationToken ct
    )
    {
        if (personIds.Count == 0)
            return [];

        var rows = await _dbContext
            .People.AsNoTracking()
            .Where(person => personIds.Contains(person.Id))
            .OrderBy(person => EF.Functions.Collate(person.LastName, GermanCollation.Name))
            .ThenBy(person => EF.Functions.Collate(person.FirstName, GermanCollation.Name))
            .ThenBy(person => person.Id)
            .Select(person => new
            {
                person.Id,
                person.FirstName,
                person.LastName,
            })
            .ToListAsync(ct);
        var portraits = await _pictures.PortraitsOfAsync(personIds, ct);

        return
        [
            .. rows.Select(row => new CastMember
            {
                PersonId = row.Id,
                FirstName = row.FirstName,
                LastName = row.LastName,
                Portrait = portraits.GetValueOrDefault(row.Id),
                IsAbsent = false,
            }),
        ];
    }

    private sealed record ActRow(
        int ActId,
        string Name,
        ActKind? Kind,
        int? SessionYear,
        bool IsArchived,
        int? GroupId,
        string? GroupName,
        GroupTone? GroupTone,
        ClubIcon? GroupIcon,
        List<ChangeRow> Changes,
        bool IsCastFrozen,
        List<int> FrozenCast,
        List<ActWishDetails> Wishes
    );

    private sealed record ChangeRow(int PersonId, CastChange Change);

    private sealed record MembershipRow(
        int GroupId,
        int PersonId,
        DateOnly JoinedOn,
        DateOnly? LeftOn
    )
    {
        [Pure]
        public bool HeldOn(DateOnly day) => JoinedOn <= day && (LeftOn is null || LeftOn >= day);
    }
}
