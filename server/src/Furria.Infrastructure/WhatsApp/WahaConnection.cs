using Furria.Application.WhatsApp;

namespace Furria.Infrastructure.WhatsApp;

public static class WahaConnection
{
    public static void Configure(HttpClient client, WhatsAppOptions options)
    {
        client.Timeout = WahaClient.Timeout;
        if (!options.IsConfigured)
            return;

        client.BaseAddress = new Uri(options.BaseUrl.TrimEnd('/') + "/");
        client.DefaultRequestHeaders.Add(WahaClient.ApiKeyHeader, options.ApiKey);
    }
}
