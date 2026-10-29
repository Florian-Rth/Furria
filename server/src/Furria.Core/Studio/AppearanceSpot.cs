using Furria.Core.Identity;
using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class AppearanceSpot
{
    public int AppearanceId { get; set; }

    public int SpotId { get; set; }

    public int? PersonId { get; set; }

    public Appearance? Appearance { get; set; }

    public Spot? Spot { get; set; }

    public Person? Person { get; set; }
}
