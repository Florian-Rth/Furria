using System.Buffers.Text;
using System.Collections.Concurrent;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;

namespace Furria.Infrastructure.Identity;

public sealed class PasswordResetMailThrottle
{
    public static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    private readonly ConcurrentDictionary<string, DateTimeOffset> _lastMailedAt = new(
        StringComparer.Ordinal
    );
    private readonly TimeProvider _timeProvider;

    public PasswordResetMailThrottle(TimeProvider timeProvider)
    {
        _timeProvider = timeProvider;
    }

    public bool TryClaim(string email)
    {
        var now = _timeProvider.GetUtcNow();
        ForgetOlderThan(now - Interval);

        var key = KeyOf(email);
        if (_lastMailedAt.TryGetValue(key, out var mailedAt) && mailedAt > now - Interval)
            return false;

        _lastMailedAt[key] = now;
        return true;
    }

    private void ForgetOlderThan(DateTimeOffset threshold)
    {
        foreach (var (key, mailedAt) in _lastMailedAt)
            if (mailedAt <= threshold)
                _lastMailedAt.TryRemove(key, out _);
    }

    [Pure]
    private static string KeyOf(string email) =>
        Base64Url.EncodeToString(
            SHA256.HashData(Encoding.UTF8.GetBytes(NormalizedEmail.Of(email)))
        );
}
