using Furria.Core.Media;
using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class ActSong
{
    public const int MostPerAct = 100;

    public int Id { get; set; }

    public int ActId { get; set; }

    public int MediaItemId { get; set; }

    public int Position { get; set; }

    public double StartSeconds { get; set; }

    public double? EndSeconds { get; set; }

    public double? FirstBeatSeconds { get; set; }

    public double? TempoBpm { get; set; }

    public Act? Act { get; set; }

    public MediaItem? MediaItem { get; set; }
}
