using System.Text.Json;

namespace Furria.Infrastructure.WhatsApp;

public static class WahaReach
{
    public static async Task<WahaAnswer<TValue>?> TryAsync<TValue>(
        Func<Task<TValue>> call,
        CancellationToken ct
    )
    {
        try
        {
            return new WahaAnswer<TValue>(await call());
        }
        catch (HttpRequestException)
        {
            return null;
        }
        catch (JsonException)
        {
            return null;
        }
        catch (TaskCanceledException) when (!ct.IsCancellationRequested)
        {
            return null;
        }
    }

    public static Task<WahaAnswer<bool>?> TryAsync(Func<Task> call, CancellationToken ct) =>
        TryAsync(
            async () =>
            {
                await call();
                return true;
            },
            ct
        );
}
