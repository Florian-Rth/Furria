using System.Collections.Concurrent;
using System.Net;

namespace Furria.Tests.Common.Push;

public sealed class FakePushService : HttpMessageHandler
{
    private readonly ConcurrentDictionary<string, HttpStatusCode> _answers = new();
    private readonly ConcurrentQueue<ReceivedPush> _received = new();

    public void Answer(string endpoint, HttpStatusCode status) => _answers[endpoint] = status;

    public void Forget()
    {
        _answers.Clear();
        _received.Clear();
    }

    public IReadOnlyList<ReceivedPush> ReceivedAt(string endpoint) =>
        [.. _received.Where(push => push.Endpoint == endpoint)];

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        var endpoint = request.RequestUri?.AbsoluteUri ?? "";
        _received.Enqueue(await ReceivedPush.ReadAsync(endpoint, request, cancellationToken));

        return new HttpResponseMessage(
            _answers.GetValueOrDefault(endpoint, HttpStatusCode.Created)
        );
    }
}
