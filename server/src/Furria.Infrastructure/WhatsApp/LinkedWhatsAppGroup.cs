using Furria.Core.Groups;

namespace Furria.Infrastructure.WhatsApp;

public sealed class LinkedWhatsAppGroup
{
    public const int ChatIdLength = 128;

    public int Id { get; set; }

    public string ChatId { get; set; } = "";

    public int? GroupId { get; set; }

    public DateTimeOffset LinkedAt { get; set; }

    public Group? Group { get; set; }
}
