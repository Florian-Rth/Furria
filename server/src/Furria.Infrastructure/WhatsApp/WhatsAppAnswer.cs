using Furria.Core.Club;
using Furria.Core.Identity;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppAnswer
{
    public const int SenderIdLength = 128;
    public const int SenderNameLength = 128;
    public const int SenderPhoneLength = 16;

    public long Id { get; set; }

    public long WhatsAppMessageId { get; set; }

    public string SenderId { get; set; } = "";

    public string? SenderName { get; set; }

    public string? SenderPhone { get; set; }

    public int? PersonId { get; set; }

    public List<int> PollOptionIds { get; set; } = [];

    public AttendanceAnswer? Attendance { get; set; }

    public DateTimeOffset AnsweredAt { get; set; }

    public WhatsAppMessage? WhatsAppMessage { get; set; }

    public Person? Person { get; set; }
}
