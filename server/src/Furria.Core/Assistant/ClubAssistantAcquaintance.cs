using Furria.Core.Identity;

namespace Furria.Core.Assistant;

public sealed class ClubAssistantAcquaintance
{
    public int PersonId { get; set; }

    public DateTimeOffset IntroducedAt { get; set; }

    public Person? Person { get; set; }
}
