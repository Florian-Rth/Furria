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

    public ActCatalogue(AppDbContext dbContext, PictureLookup pictures)
    {
        _dbContext = dbContext;
        _pictures = pictures;
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
                act.ArchivedAt != null,
                act.GroupId,
                act.Group == null ? null : act.Group.Name,
                act.Group == null ? null : act.Group.Tone,
                act.Group == null ? null : act.Group.Icon,
                act.CastChanges.Select(change => new ChangeRow(change.PersonId, change.Change))
                    .ToList(),
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
        var members = await MembersOnAsync(groupIds, day, ct);
        var personIds = members
            .SelectMany(group => group.Value)
            .Concat(acts.SelectMany(act => act.Changes.Select(change => change.PersonId)))
            .ToHashSet();
        var persons = await PersonsInNameOrderAsync(personIds, ct);
        var groupPictures = await _pictures.GroupPicturesOfAsync(groupIds, ct);

        return
        [
            .. acts.Select(act =>
                SummaryOf(act, members, persons, groupPictures.GetValueOrDefault(act.GroupId ?? 0))
            ),
        ];
    }

    [Pure]
    private static ActSummary SummaryOf(
        ActRow act,
        IReadOnlyDictionary<int, IReadOnlyList<int>> members,
        IReadOnlyList<CastMember> persons,
        PictureDetails? groupPicture
    )
    {
        var added = PersonsChanged(act, CastChange.Added);
        var removed = PersonsChanged(act, CastChange.Removed);
        var groupMembers = act.GroupId is { } groupId ? members.GetValueOrDefault(groupId, []) : [];
        var cast = groupMembers.Concat(added).Except(removed).ToHashSet();

        return new ActSummary
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
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

    private async Task<IReadOnlyDictionary<int, IReadOnlyList<int>>> MembersOnAsync(
        IReadOnlyCollection<int> groupIds,
        DateOnly day,
        CancellationToken ct
    )
    {
        if (groupIds.Count == 0)
            return new Dictionary<int, IReadOnlyList<int>>();

        var rows = await _dbContext
            .GroupMemberships.AsNoTracking()
            .Where(membership =>
                groupIds.Contains(membership.GroupId)
                && membership.JoinedOn <= day
                && (membership.LeftOn == null || membership.LeftOn >= day)
            )
            .Select(membership => new { membership.GroupId, membership.PersonId })
            .ToListAsync(ct);

        return rows.GroupBy(row => row.GroupId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<int>)[.. group.Select(row => row.PersonId).Distinct()]
            );
    }

    private async Task<IReadOnlyList<CastMember>> PersonsInNameOrderAsync(
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
        bool IsArchived,
        int? GroupId,
        string? GroupName,
        GroupTone? GroupTone,
        ClubIcon? GroupIcon,
        List<ChangeRow> Changes,
        List<ActWishDetails> Wishes
    );

    private sealed record ChangeRow(int PersonId, CastChange Change);
}
