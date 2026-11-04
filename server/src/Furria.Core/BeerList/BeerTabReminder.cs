using Furria.Core.Identity;

namespace Furria.Core.BeerList;

public sealed class BeerTabReminder
{
    public int PersonId { get; set; }

    public DateTimeOffset SentAt { get; set; }

    public Person? Person { get; set; }
}
