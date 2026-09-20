using Furria.Core.Identity;
using Microsoft.AspNetCore.Identity;

namespace Furria.Infrastructure.Identity;

public sealed class Account : IdentityUser<int>
{
    public int PersonId { get; set; }

    public bool IsDisabled { get; set; }

    public DateTimeOffset? LastSeenAnnouncementAt { get; set; }

    public Person? Person { get; set; }
}
