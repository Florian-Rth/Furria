using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

internal sealed record AnnouncementReminder(
    AnnouncementAddOnKind Kind,
    int AddOnId,
    string? Subject
);
