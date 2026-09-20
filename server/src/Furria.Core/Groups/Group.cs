using Furria.Core.Club;

namespace Furria.Core.Groups;

public sealed class Group : ITimestamped
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public string Description { get; set; } = "";

    public bool IsRecruiting { get; set; }

    public int? GroupKindId { get; set; }

    public int? FoundedYear { get; set; }

    public GroupTone? Tone { get; set; }

    public DateOnly? ArchivedOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<GroupMembership> Memberships { get; set; } = [];

    public ICollection<GroupAdmin> Admins { get; set; } = [];

    public GroupKind? GroupKind { get; set; }

    public ICollection<GroupTrainingSlot> TrainingSlots { get; set; } = [];
}
