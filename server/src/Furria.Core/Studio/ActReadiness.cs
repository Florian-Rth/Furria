using System.Diagnostics.Contracts;
using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public static class ActReadiness
{
    private static readonly ActKind[] StudioKinds = [ActKind.Dance, ActKind.Show];

    [Pure]
    public static IReadOnlyList<ReadinessCheckResult> ChecksOf(
        ActKind? kind,
        ActReadinessFacts facts
    ) =>
        kind is { } studioKind && StudioKinds.Contains(studioKind)
            ? [.. StudioChecksOf(facts), CastCheckOf(facts)]
            : [CastCheckOf(facts)];

    [Pure]
    private static IEnumerable<ReadinessCheckResult> StudioChecksOf(ActReadinessFacts facts) =>
        [
            new(ReadinessCheck.Music, facts.SongCount > 0 || facts.HasAdoptedFinalFile),
            new(ReadinessCheck.Steps, facts.StepCount > 0),
            new(ReadinessCheck.Formation, HasFullFormation(facts)),
            new(ReadinessCheck.Videos, facts.VideoCount > 0),
            new(ReadinessCheck.FinalFile, facts.HasAdoptedFinalFile),
        ];

    [Pure]
    private static ReadinessCheckResult CastCheckOf(ActReadinessFacts facts) =>
        new(ReadinessCheck.Cast, facts.CastCount > 0);

    [Pure]
    private static bool HasFullFormation(ActReadinessFacts facts) =>
        facts.SpotCount > 0
        && facts.HeldSpotCount == facts.SpotCount
        && facts.PlacedSpotCount == facts.SpotCount;
}
