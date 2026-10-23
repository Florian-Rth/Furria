using Furria.Core.Identity;

namespace Furria.Core.RunningOrders;

public sealed class ActCastChange
{
    public int ActId { get; set; }

    public int PersonId { get; set; }

    public CastChange Change { get; set; }

    public Act? Act { get; set; }

    public Person? Person { get; set; }
}
