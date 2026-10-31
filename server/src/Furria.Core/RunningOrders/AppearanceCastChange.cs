using Furria.Core.Identity;

namespace Furria.Core.RunningOrders;

public sealed class AppearanceCastChange
{
    public int AppearanceId { get; set; }

    public int PersonId { get; set; }

    public CastChange Change { get; set; }

    public Appearance? Appearance { get; set; }

    public Person? Person { get; set; }
}
