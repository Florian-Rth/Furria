using Furria.Core.Identity;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppGroupAdd
{
    public const int PhoneDigitsLength = 32;

    public int Id { get; set; }

    public string ChatId { get; set; } = "";

    public int PersonId { get; set; }

    public string PhoneDigits { get; set; } = "";

    public WhatsAppGroupAddState State { get; set; }

    public DateTimeOffset ChangedAt { get; set; }

    public Person? Person { get; set; }
}
