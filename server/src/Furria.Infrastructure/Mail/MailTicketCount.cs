using System.Diagnostics.Contracts;
using System.Globalization;

namespace Furria.Infrastructure.Mail;

public static class MailTicketCount
{
    [Pure]
    public static string Of(int ticketCount) =>
        ticketCount == 1
            ? "1 Karte"
            : $"{ticketCount.ToString(CultureInfo.InvariantCulture)} Karten";
}
