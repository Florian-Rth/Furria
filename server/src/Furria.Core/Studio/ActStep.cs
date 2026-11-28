using Furria.Core.Media;
using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class ActStep
{
    public const int NameLength = 80;

    public int Id { get; set; }

    public int ActId { get; set; }

    public int StartSourceMediaItemId { get; set; }

    public double StartSeconds { get; set; }

    public int EndSourceMediaItemId { get; set; }

    public double EndSeconds { get; set; }

    public bool StartNeedsCheck { get; set; }

    public bool EndNeedsCheck { get; set; }

    public string Name { get; set; } = "";

    public Act? Act { get; set; }

    public MediaItem? StartSource { get; set; }

    public MediaItem? EndSource { get; set; }
}
