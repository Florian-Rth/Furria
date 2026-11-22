using Furria.Core.Club;

namespace Furria.Infrastructure.WhatsApp;

public sealed record WhatsAppIncomingAnswer
{
    public required string MessageKey { get; init; }

    public required string SenderId { get; init; }

    public required DateTimeOffset AnsweredAt { get; init; }

    public IReadOnlyList<string> SelectedOptions { get; init; } = [];

    public AttendanceAnswer? Attendance { get; init; }
}
