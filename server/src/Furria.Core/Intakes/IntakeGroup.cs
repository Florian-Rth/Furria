using Furria.Core.Groups;

namespace Furria.Core.Intakes;

public sealed class IntakeGroup
{
    public int IntakeId { get; set; }

    public int GroupId { get; set; }

    public Intake? Intake { get; set; }

    public Group? Group { get; set; }
}
