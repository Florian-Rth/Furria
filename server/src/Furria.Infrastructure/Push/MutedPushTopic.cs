using Furria.Core.Push;
using Furria.Infrastructure.Identity;

namespace Furria.Infrastructure.Push;

public sealed class MutedPushTopic
{
    public int AccountId { get; set; }

    public PushTopic Topic { get; set; }

    public Account? Account { get; set; }
}
