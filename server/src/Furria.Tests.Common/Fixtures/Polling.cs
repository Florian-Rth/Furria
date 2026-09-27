using System.Diagnostics;

namespace Furria.Tests.Common.Fixtures;

public static class Polling
{
    private static readonly TimeSpan Interval = TimeSpan.FromMilliseconds(50);

    public static async Task<T> UntilAsync<T>(
        Func<CancellationToken, Task<T?>> probe,
        TimeSpan timeout,
        string timeoutMessage,
        CancellationToken ct
    )
        where T : class
    {
        var deadline = Stopwatch.StartNew();

        while (true)
        {
            if (await probe(ct) is { } found)
                return found;

            if (deadline.Elapsed >= timeout)
                throw new TimeoutException($"{timeoutMessage} (waited {timeout.TotalSeconds} s)");

            await Task.Delay(Interval, ct);
        }
    }
}
