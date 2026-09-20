using Furria.Core.Groups;

namespace Furria.Application.Groups;

public sealed record GroupDetails
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required int? GroupKindId { get; init; }

    public required string? GroupKindName { get; init; }

    public required int? FoundedYear { get; init; }

    public required GroupTone? Tone { get; init; }

    public required IReadOnlyList<GroupTrainingSlotDetails> TrainingSlots { get; init; }

    public required IReadOnlyList<HubAdministrator> Admins { get; init; }

    public required IReadOnlyList<HubMember> Members { get; init; }

    public required bool ViewerIsMember { get; init; }

    public required bool ViewerIsAdmin { get; init; }

    public required DateOnly? ViewerSince { get; init; }

    public required IReadOnlyList<HubMember> PastMembers { get; init; }

    public required IReadOnlyList<HubAdministrator> PastAdmins { get; init; }
}
