using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record WhatsAppUnassignedAnswer
{
    public required string? WhatsAppName { get; init; }

    public required string? Phone { get; init; }

    public required AttendanceAnswer Answer { get; init; }
}
