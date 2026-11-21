using System.Diagnostics.Contracts;
using Furria.Application.WhatsApp;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppSenders
{
    public const string PhoneServer = "@c.us";

    private const char ServerSeparator = '@';
    private const char DeviceSeparator = ':';

    private static readonly string[] PhoneServers = ["c.us", "s.whatsapp.net"];

    [Pure]
    public static bool IsLinkedId(string chatId) =>
        chatId.EndsWith("@lid", StringComparison.Ordinal);

    [Pure]
    public static string? PhoneDigitsOf(string chatId) =>
        chatId.Split(ServerSeparator) is [var user, var server] && PhoneServers.Contains(server)
            ? WhatsAppPhoneNumbers.InternationalDigitsOf("+" + user.Split(DeviceSeparator)[0])
            : null;

    [Pure]
    public static int? PersonIdOf(string senderDigits, IEnumerable<WhatsAppPersonPhone> people) =>
        people
            .Where(person =>
                WhatsAppPhoneNumbers.InternationalDigitsOf(person.Phone) == senderDigits
            )
            .Select(person => person.PersonId)
            .Distinct()
            .Take(2)
            .ToList()
            is [var only]
            ? only
            : null;
}
