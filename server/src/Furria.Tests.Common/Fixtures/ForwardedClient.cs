using Microsoft.AspNetCore.Mvc.Testing;

namespace Furria.Tests.Common.Fixtures;

public static class ForwardedClient
{
    private const string ForwardedForHeader = "X-Forwarded-For";

    public static HttpClient CreateClientForwardedFor(
        this WebApplicationFactory<Program> host,
        string forwardedFor
    )
    {
        var client = host.CreateClient();
        client.DefaultRequestHeaders.Add(ForwardedForHeader, forwardedFor);
        return client;
    }
}
