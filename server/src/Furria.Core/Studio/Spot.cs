using Furria.Core.Identity;
using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class Spot
{
    public int Id { get; set; }

    public int ActId { get; set; }

    public int Number { get; set; }

    public int? PersonId { get; set; }

    public Act? Act { get; set; }

    public Person? Person { get; set; }
}
