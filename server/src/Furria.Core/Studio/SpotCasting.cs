using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class SpotCasting
{
    [Pure]
    public static IReadOnlyList<SpotAssignment> EveningOf(
        IEnumerable<SpotAssignment> session,
        IEnumerable<SpotAssignment> eveningChanges
    )
    {
        var changes = eveningChanges
            .GroupBy(change => change.SpotId)
            .ToDictionary(spot => spot.Key, spot => spot.Last());

        return
        [
            .. session.Select(spot =>
                changes.TryGetValue(spot.SpotId, out var change) ? change : spot
            ),
        ];
    }

    [Pure]
    public static IReadOnlyList<int> PeopleOnSeveralSpots(
        IEnumerable<SpotAssignment> assignments
    ) =>
        [
            .. assignments
                .Select(spot => spot.PersonId)
                .OfType<int>()
                .GroupBy(personId => personId)
                .Where(spots => spots.Count() > 1)
                .Select(spots => spots.Key)
                .Order(),
        ];

    [Pure]
    public static IReadOnlyList<SpotAssignment> EveningChangesAfter(
        IReadOnlyList<SpotAssignment> session,
        IEnumerable<SpotAssignment> eveningChanges,
        SpotAssignment assigned
    )
    {
        var sessionPeople = session.ToDictionary(spot => spot.SpotId, spot => spot.PersonId);

        return
        [
            .. EveningOf(session, eveningChanges)
                .Select(spot => Reassigned(spot, assigned))
                .Where(spot => sessionPeople[spot.SpotId] != spot.PersonId),
        ];
    }

    [Pure]
    private static SpotAssignment Reassigned(SpotAssignment spot, SpotAssignment assigned) =>
        spot.SpotId == assigned.SpotId ? assigned
        : assigned.PersonId is not null && spot.PersonId == assigned.PersonId
            ? spot with
            {
                PersonId = null,
            }
        : spot;
}
