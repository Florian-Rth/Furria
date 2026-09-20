using Furria.Core.Roles;

namespace Furria.Core.Club;

public sealed class BoardOffice : ITimestamped
{
    public int Id { get; set; }

    public int? ImpliedRoleId { get; set; }

    public string Name { get; set; } = "";

    public int SortOrder { get; set; }

    public DateOnly? ArchivedOn { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Role? ImpliedRole { get; set; }
}
