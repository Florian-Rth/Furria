using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;

namespace Furria.Application.Studio;

public sealed record MyActSummary
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required int SessionYear { get; init; }

    public required ActGroupReference? Group { get; init; }

    public required bool ViewerInCast { get; init; }

    public required bool ViewerLeads { get; init; }

    public required bool IsPlayable { get; init; }

    public required IReadOnlyList<CastMember> Cast { get; init; }

    public required IReadOnlyList<CastMember> Editors { get; init; }

    public required MyActEveningSummary? NextEvening { get; init; }

    public required MyActTrainingSummary? NextTraining { get; init; }
}
