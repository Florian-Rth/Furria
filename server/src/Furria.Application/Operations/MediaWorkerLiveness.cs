using System.Diagnostics.Contracts;

namespace Furria.Application.Operations;

public static class MediaWorkerLiveness
{
    public static readonly TimeSpan BeatInterval = TimeSpan.FromSeconds(15);
    public static readonly TimeSpan AliveWithin = TimeSpan.FromSeconds(45);
    public static readonly TimeSpan ForgottenAfter = TimeSpan.FromHours(24);

    [Pure]
    public static bool IsAlive(DateTimeOffset lastSeenAt, DateTimeOffset now) =>
        now - lastSeenAt <= AliveWithin;
}
