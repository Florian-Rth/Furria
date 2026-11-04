using Furria.Infrastructure.Identity;

namespace Furria.Infrastructure.Push;

public sealed class PushSubscription
{
    public int Id { get; set; }

    public int AccountId { get; set; }

    public string Endpoint { get; set; } = "";

    public string PublicKey { get; set; } = "";

    public string AuthSecret { get; set; } = "";

    public DateTimeOffset SubscribedAt { get; set; }

    public Account? Account { get; set; }
}
