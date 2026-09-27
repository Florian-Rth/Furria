using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace Furria.Tests.Common.Fixtures;

public sealed class MailpitInbox : IDisposable
{
    private const string MessagesRoute = "api/v1/messages?limit=1000";
    private const string MessageRoute = "api/v1/message/";

    private static readonly TimeSpan ArrivalTimeout = TimeSpan.FromSeconds(20);

    private readonly HttpClient _http;

    public MailpitInbox(Uri apiBase)
    {
        _http = new HttpClient { BaseAddress = apiBase };
    }

    public async Task<ReceivedMail> SingleMailToAsync(string recipient, CancellationToken ct)
    {
        var mails = await MailsToAsync(recipient, 1, ct);
        if (mails.Count != 1)
            throw new InvalidOperationException(
                $"Expected exactly one mail to {recipient}, found {mails.Count}."
            );

        return mails[0];
    }

    public async Task<IReadOnlyList<ReceivedMail>> MailsToAsync(
        string recipient,
        int expectedCount,
        CancellationToken ct
    )
    {
        var summaries = await Polling.UntilAsync(
            async token =>
            {
                var arrived = await SummariesToAsync(recipient, token);
                return arrived.Count >= expectedCount ? arrived : null;
            },
            ArrivalTimeout,
            $"Mailpit never received {expectedCount} mail(s) to {recipient}",
            ct
        );

        var mails = new List<ReceivedMail>();
        foreach (var summary in summaries.OrderBy(summary => summary.Created))
            mails.Add(await ReadAsync(summary.Id, ct));

        return mails;
    }

    public void Dispose() => _http.Dispose();

    private async Task<IReadOnlyList<MessageSummary>> SummariesToAsync(
        string recipient,
        CancellationToken ct
    )
    {
        var page =
            await _http.GetFromJsonAsync<MessagesPage>(MessagesRoute, ct)
            ?? throw new InvalidOperationException("Mailpit returned an empty message list.");

        return
        [
            .. page.Messages.Where(message =>
                message.To.Any(address =>
                    string.Equals(address.Address, recipient, StringComparison.OrdinalIgnoreCase)
                )
            ),
        ];
    }

    private async Task<ReceivedMail> ReadAsync(string id, CancellationToken ct)
    {
        var message =
            await _http.GetFromJsonAsync<MessageBody>($"{MessageRoute}{id}", ct)
            ?? throw new InvalidOperationException($"Mailpit returned no message {id}.");

        return new ReceivedMail
        {
            Id = message.Id,
            Subject = message.Subject,
            Text = message.Text,
            Html = message.Html,
        };
    }

    private sealed record MessagesPage
    {
        [JsonPropertyName("messages")]
        public IReadOnlyList<MessageSummary> Messages { get; init; } = [];
    }

    private sealed record MessageSummary
    {
        [JsonPropertyName("ID")]
        public string Id { get; init; } = "";

        [JsonPropertyName("To")]
        public IReadOnlyList<MailAddress> To { get; init; } = [];

        [JsonPropertyName("Created")]
        public DateTimeOffset Created { get; init; }
    }

    private sealed record MailAddress
    {
        [JsonPropertyName("Address")]
        public string Address { get; init; } = "";
    }

    private sealed record MessageBody
    {
        [JsonPropertyName("ID")]
        public string Id { get; init; } = "";

        [JsonPropertyName("Subject")]
        public string Subject { get; init; } = "";

        [JsonPropertyName("Text")]
        public string Text { get; init; } = "";

        [JsonPropertyName("HTML")]
        public string Html { get; init; } = "";
    }
}
