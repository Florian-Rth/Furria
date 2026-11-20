using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;

namespace Furria.Tests.Common.WhatsApp;

public sealed class FakeWahaService : HttpMessageHandler
{
    private const string GroupsRouteEnd = "/groups";

    private readonly ConcurrentDictionary<string, string> _groups = new();

    public void JoinGroup(string chatId, string name) => _groups[chatId] = name;

    public void Forget() => _groups.Clear();

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    ) =>
        Task.FromResult(
            request.Method == HttpMethod.Get
            && request.RequestUri?.AbsolutePath.EndsWith(GroupsRouteEnd, StringComparison.Ordinal)
                == true
                ? Json(GroupsJson())
                : new HttpResponseMessage(HttpStatusCode.NotFound)
        );

    private string GroupsJson() =>
        JsonSerializer.Serialize(
            _groups.Select(group => new { id = group.Key, subject = group.Value })
        );

    private static HttpResponseMessage Json(string body) =>
        new(HttpStatusCode.OK)
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json"),
        };
}
