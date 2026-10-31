using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class ActPart
{
    public const int NameLength = 80;

    public int Id { get; set; }

    public int ActId { get; set; }

    public int FirstStepId { get; set; }

    public string Name { get; set; } = "";

    public int? MainVideoId { get; set; }

    public Act? Act { get; set; }

    public ActStep? FirstStep { get; set; }

    public ActVideo? MainVideo { get; set; }
}
