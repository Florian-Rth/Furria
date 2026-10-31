using Furria.Core.Media;
using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class ActVideo
{
    public const int NameLength = 80;
    public const int MostPerAct = 100;

    public int Id { get; set; }

    public int ActId { get; set; }

    public int MediaItemId { get; set; }

    public string? Name { get; set; }

    public int? StartSourceMediaItemId { get; set; }

    public double? StartSeconds { get; set; }

    public double StartVideoSeconds { get; set; }

    public Act? Act { get; set; }

    public MediaItem? MediaItem { get; set; }

    public MediaItem? StartSource { get; set; }
}
