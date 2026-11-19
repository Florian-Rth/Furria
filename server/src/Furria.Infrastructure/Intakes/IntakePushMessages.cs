using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Infrastructure.Push;

namespace Furria.Infrastructure.Intakes;

internal static class IntakePushMessages
{
    private const string CompletedTitle = "Neuzugang eingetragen";
    private const string NeedsReviewTitle = "Neuzugang prüfen";

    private static readonly TimeSpan TimeToLive = TimeSpan.FromDays(7);

    [Pure]
    internal static OutboxPush For(IntakePush push, int accountId, DateTimeOffset now) =>
        new()
        {
            AccountId = accountId,
            Title = push.Kind == IntakePushKind.Completed ? CompletedTitle : NeedsReviewTitle,
            Body = push.NewcomerName,
            Url = string.Create(CultureInfo.InvariantCulture, $"/manage/intakes/{push.IntakeId}"),
            Tag = string.Create(CultureInfo.InvariantCulture, $"intake-{push.IntakeId}"),
            ExpiresAt = now + TimeToLive,
        };
}
