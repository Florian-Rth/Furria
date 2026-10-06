using System.Collections.Concurrent;

namespace Furria.Api.Altcha;

public sealed class SpentAltchaChallenges
{
    private readonly ConcurrentDictionary<string, DateTimeOffset> _expiryByNonce = new(
        StringComparer.Ordinal
    );
    private readonly TimeProvider _timeProvider;

    public SpentAltchaChallenges(TimeProvider timeProvider)
    {
        _timeProvider = timeProvider;
    }

    public bool TrySpend(string nonce, DateTimeOffset expiresAt)
    {
        ForgetExpired(_timeProvider.GetUtcNow());
        return _expiryByNonce.TryAdd(nonce, expiresAt);
    }

    private void ForgetExpired(DateTimeOffset now)
    {
        foreach (var (nonce, expiresAt) in _expiryByNonce)
        {
            if (expiresAt <= now)
                _expiryByNonce.TryRemove(nonce, out _);
        }
    }
}
