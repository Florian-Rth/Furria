using System.Diagnostics.Contracts;
using Furria.Infrastructure.Push;

namespace Furria.Infrastructure.WhatsApp;

internal static class WhatsAppPushMessages
{
    private const string SessionDroppedTitle = "WhatsApp getrennt";
    private const string SessionDroppedBody =
        "Der Vereins-Bot ist nicht mehr mit WhatsApp verbunden. Beiträge warten, bis er neu verbunden ist.";
    private const string SettingsUrl = "/manage/system/whatsapp";
    private const string SessionTag = "whatsapp-session";

    private static readonly TimeSpan SessionDroppedLifetime = TimeSpan.FromDays(1);

    [Pure]
    internal static OutboxPush SessionDropped(int accountId, DateTimeOffset now) =>
        new()
        {
            AccountId = accountId,
            Title = SessionDroppedTitle,
            Body = SessionDroppedBody,
            Url = SettingsUrl,
            Tag = SessionTag,
            ExpiresAt = now + SessionDroppedLifetime,
        };
}
