namespace MyProduct.Tests.Common;

// Shared real-wall-clock poll helper. The sanctioned alternative to a fixed Task.Delay when a
// test must wait on an asynchronous side effect (a background consumer, a relay broadcast):
// re-check the predicate on a short interval until it holds or the timeout elapses. Reads the
// system clock deliberately — the deadline must advance even when the host injects a frozen
// FakeTimeProvider.
public static class Polling
{
    public static async Task WaitUntilAsync(
        Func<Task<bool>> predicate,
        TimeSpan timeout,
        TimeSpan? pollInterval = null,
        CancellationToken ct = default
    )
    {
        var interval = pollInterval ?? TimeSpan.FromMilliseconds(250);
        var deadline = DateTime.UtcNow + timeout;

        while (DateTime.UtcNow < deadline)
        {
            ct.ThrowIfCancellationRequested();

            if (await predicate())
                return;

            var remaining = deadline - DateTime.UtcNow;
            if (remaining <= TimeSpan.Zero)
                break;

            await Task.Delay(remaining < interval ? remaining : interval, ct);
        }

        throw new TimeoutException($"Condition not met within {timeout.TotalSeconds:F1}s");
    }
}
