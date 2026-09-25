using Furria.Core.Identity;

namespace Furria.Infrastructure.Identity;

public sealed class AccountEvent
{
    public long Id { get; set; }

    public int PersonId { get; set; }

    public AccountEventKind Kind { get; set; }

    public int? ActorPersonId { get; set; }

    public DateTimeOffset At { get; set; }

    public Person? Person { get; set; }

    public Person? Actor { get; set; }
}
