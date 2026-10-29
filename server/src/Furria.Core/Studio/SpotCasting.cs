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
}
