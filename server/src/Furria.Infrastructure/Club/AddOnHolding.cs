namespace Furria.Infrastructure.Club;

internal sealed record AddOnHolding<TAddOn>(ICollection<TAddOn> Held, DateTimeOffset? HostClosesAt);
