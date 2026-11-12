namespace Furria.Infrastructure.Club;

internal abstract record AddOnHost
{
    public abstract DateTimeOffset? ClosesAt { get; }
}
