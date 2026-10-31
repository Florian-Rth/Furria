using Furria.Core.Identity;
using Furria.Core.RunningOrders;

namespace Furria.Core.Studio;

public sealed class ActCoEditor
{
    public int ActId { get; set; }

    public int PersonId { get; set; }

    public int? GrantedByPersonId { get; set; }

    public DateTimeOffset GrantedAt { get; set; }

    public Act? Act { get; set; }

    public Person? Person { get; set; }

    public Person? GrantedBy { get; set; }
}
