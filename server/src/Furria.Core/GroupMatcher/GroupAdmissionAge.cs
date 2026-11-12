using Furria.Core.Groups;

namespace Furria.Core.GroupMatcher;

public sealed class GroupAdmissionAge
{
    public int GroupId { get; set; }

    public AdmissionAgeBand Band { get; set; }

    public Group? Group { get; set; }
}
