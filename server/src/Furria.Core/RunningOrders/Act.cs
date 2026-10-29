using Furria.Core.Club;
using Furria.Core.Groups;

namespace Furria.Core.RunningOrders;

public sealed class Act : ITimestamped
{
    public int Id { get; set; }

    public string Name { get; set; } = "";

    public int? GroupId { get; set; }

    public ActKind? Kind { get; set; }

    public int? SessionYear { get; set; }

    public int? FollowsActId { get; set; }

    public DateTimeOffset? CastFrozenAt { get; set; }

    public DateTimeOffset? ArchivedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Group? Group { get; set; }

    public Act? FollowsAct { get; set; }

    public ICollection<ActCastChange> CastChanges { get; set; } = [];

    public ICollection<ActWish> Wishes { get; set; } = [];

    public ICollection<FrozenCastMember> FrozenCast { get; set; } = [];
}
