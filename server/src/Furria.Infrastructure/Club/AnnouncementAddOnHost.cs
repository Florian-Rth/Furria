using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

internal sealed record AnnouncementAddOnHost(
    int AnnouncementId,
    int? AuthorPersonId,
    DateOnly? ValidUntil
) : AddOnHost
{
    public override DateTimeOffset? ClosesAt => AnnouncementAddOns.ClosesAt(ValidUntil);
}
