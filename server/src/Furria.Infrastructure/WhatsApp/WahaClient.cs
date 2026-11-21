using System.Diagnostics.Contracts;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Furria.Application.WhatsApp;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WahaClient
{
    public const string ApiKeyHeader = "X-Api-Key";

    private static readonly JsonSerializerOptions WireOptions = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public static readonly TimeSpan Timeout = TimeSpan.FromSeconds(30);

    private readonly HttpClient _http;
    private readonly string _sessionName;
    private readonly string _sessionSegment;

    public WahaClient(HttpClient http, IOptions<WhatsAppOptions> options)
    {
        _http = http;
        _sessionName = options.Value.Session;
        _sessionSegment = Uri.EscapeDataString(_sessionName);
    }

    public Task CreateSessionAsync(CancellationToken ct) =>
        PostAsync("api/sessions", new SessionCreation(_sessionName), ct);

    public Task StartSessionAsync(CancellationToken ct) =>
        PostAsync($"api/sessions/{_sessionSegment}/start", new { }, ct);

    public Task RestartSessionAsync(CancellationToken ct) =>
        PostAsync($"api/sessions/{_sessionSegment}/restart", new { }, ct);

    public async Task<WahaSessionInfo?> SessionAsync(CancellationToken ct)
    {
        using var response = await _http.GetAsync($"api/sessions/{_sessionSegment}", ct);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            return null;

        var session = await ReadAsync(response, ct);
        return new WahaSessionInfo(
            WahaSessionStatuses.Parse(WahaJson.TextOf(session, "status")),
            session.ValueKind == JsonValueKind.Object && session.TryGetProperty("me", out var me)
                ? WahaJson.TextOf(me, "id")
                : null
        );
    }

    public async Task<string?> QrCodeAsync(CancellationToken ct) =>
        WahaJson.TextOf(await GetAsync($"api/{_sessionSegment}/auth/qr?format=raw", ct), "value");

    public async Task<string?> RequestPairingCodeAsync(string phoneNumber, CancellationToken ct) =>
        WahaJson.TextOf(
            await PostAsync(
                $"api/{_sessionSegment}/auth/request-code",
                new PairingCodeRequest(phoneNumber),
                ct
            ),
            "code"
        );

    public async Task<IReadOnlyList<WahaGroup>> GroupsAsync(CancellationToken ct) =>
        GroupsOf(await GetAsync($"api/{_sessionSegment}/groups", ct));

    public async Task<string?> SendTextAsync(WahaOutgoingText text, CancellationToken ct) =>
        WahaJson.MessageIdOf(
            await PostAsync(
                "api/sendText",
                new TextMessage(
                    _sessionName,
                    text.ChatId,
                    text.Text,
                    text.ReplyTo,
                    MentionsOf(text.Mentions)
                ),
                ct
            )
        );

    public async Task<string?> SendImageAsync(WahaOutgoingImage image, CancellationToken ct) =>
        WahaJson.MessageIdOf(
            await PostAsync(
                "api/sendImage",
                new ImageMessage(
                    _sessionName,
                    image.ChatId,
                    new MessageFile(
                        image.MimeType,
                        image.FileName,
                        Convert.ToBase64String(image.Content)
                    ),
                    image.Caption,
                    image.ReplyTo,
                    MentionsOf(image.Mentions)
                ),
                ct
            )
        );

    public async Task<string?> SendPollAsync(WahaOutgoingPoll poll, CancellationToken ct) =>
        WahaJson.MessageIdOf(
            await PostAsync(
                "api/sendPoll",
                new PollMessage(
                    _sessionName,
                    poll.ChatId,
                    new PollContent(poll.Question, poll.Options, poll.AllowsSeveralAnswers),
                    poll.ReplyTo
                ),
                ct
            )
        );

    public async Task<string?> SendEventAsync(WahaOutgoingEvent outgoing, CancellationToken ct) =>
        WahaJson.MessageIdOf(
            await PostAsync(
                $"api/{_sessionSegment}/events",
                new EventMessage(outgoing.ChatId, EventContentOf(outgoing), outgoing.ReplyTo),
                ct
            )
        );

    public async Task EditTextAsync(
        string chatId,
        string messageId,
        string text,
        CancellationToken ct
    )
    {
        using var response = await _http.PutAsJsonAsync(
            MessageRoute(chatId, messageId),
            new EditedText(text),
            WireOptions,
            ct
        );
        await EnsureAnsweredAsync(response, ct);
    }

    public async Task DeleteMessageAsync(string chatId, string messageId, CancellationToken ct)
    {
        using var response = await _http.DeleteAsync(MessageRoute(chatId, messageId), ct);
        await EnsureAnsweredAsync(response, ct);
    }

    public async Task<WahaAddOutcome> AddParticipantAsync(
        string groupChatId,
        string participantId,
        CancellationToken ct
    ) =>
        WahaAddOutcomes.Of(
            await PostAsync(
                $"{GroupRoute(groupChatId)}/participants/add",
                new ParticipantsChange([new ParticipantId(participantId)]),
                ct
            )
        );

    public async Task<string?> InviteLinkAsync(string groupChatId, CancellationToken ct) =>
        WahaInviteLinks.Of(await GetAsync($"{GroupRoute(groupChatId)}/invite-code", ct));

    public async Task<IReadOnlyList<WahaParticipant>> ParticipantsAsync(
        string groupChatId,
        CancellationToken ct
    ) => ParticipantsOf(await GetAsync($"{GroupRoute(groupChatId)}/participants/v2", ct));

    public async Task<string?> PhoneIdOfLidAsync(string lid, CancellationToken ct)
    {
        using var response = await _http.GetAsync(
            $"api/{_sessionSegment}/lids/{Uri.EscapeDataString(lid)}",
            ct
        );
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            return null;

        return WahaJson.TextOf(await ReadAsync(response, ct), "pn");
    }

    public async Task<string?> ContactNameAsync(string contactId, CancellationToken ct)
    {
        using var response = await _http.GetAsync(
            $"api/contacts?contactId={Uri.EscapeDataString(contactId)}&session={_sessionSegment}",
            ct
        );
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            return null;

        return WahaJson.TextOf(await ReadAsync(response, ct), "pushname", "name");
    }

    private string GroupRoute(string groupChatId) =>
        $"api/{_sessionSegment}/groups/{Uri.EscapeDataString(groupChatId)}";

    private string MessageRoute(string chatId, string messageId) =>
        $"api/{_sessionSegment}/chats/{Uri.EscapeDataString(chatId)}/messages/{Uri.EscapeDataString(messageId)}";

    private async Task<JsonElement> GetAsync(string route, CancellationToken ct)
    {
        using var response = await _http.GetAsync(route, ct);
        return await ReadAsync(response, ct);
    }

    private async Task<JsonElement> PostAsync<TBody>(string route, TBody body, CancellationToken ct)
    {
        using var response = await _http.PostAsJsonAsync(route, body, WireOptions, ct);
        return await ReadAsync(response, ct);
    }

    private static async Task EnsureAnsweredAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        if (response.IsSuccessStatusCode)
            return;

        throw new WahaCallFailedException(
            response.StatusCode,
            await response.Content.ReadAsStringAsync(ct)
        );
    }

    private static async Task<JsonElement> ReadAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        await EnsureAnsweredAsync(response, ct);
        var content = await response.Content.ReadAsByteArrayAsync(ct);
        if (content.Length == 0)
            return default;

        using var document = JsonDocument.Parse(content);
        return document.RootElement.Clone();
    }

    [Pure]
    private static IReadOnlyList<string>? MentionsOf(IReadOnlyList<string> mentions) =>
        mentions.Count == 0 ? null : mentions;

    [Pure]
    private static EventContent EventContentOf(WahaOutgoingEvent outgoing) =>
        new(
            outgoing.Name,
            outgoing.Description,
            outgoing.StartsAt.ToUnixTimeSeconds(),
            outgoing.EndsAt?.ToUnixTimeSeconds(),
            outgoing.Place is { } place ? new EventLocation(place) : null,
            ExtraGuestsAllowed: false
        );

    [Pure]
    private static IReadOnlyList<WahaGroup> GroupsOf(JsonElement groups) =>
        groups.ValueKind == JsonValueKind.Array
            ?
            [
                .. groups
                    .EnumerateArray()
                    .Select(group =>
                        (
                            ChatId: WahaJson.TextOf(group, "id", "JID"),
                            Name: WahaJson.TextOf(group, "subject", "name", "Name")
                        )
                    )
                    .Select(group =>
                        group.ChatId is { } chatId
                            ? new WahaGroup(chatId, group.Name ?? chatId)
                            : null
                    )
                    .OfType<WahaGroup>(),
            ]
            : [];

    [Pure]
    private static IReadOnlyList<WahaParticipant> ParticipantsOf(JsonElement participants) =>
        participants.ValueKind == JsonValueKind.Array
            ?
            [
                .. participants
                    .EnumerateArray()
                    .Select(participant =>
                        (
                            Id: WahaJson.TextOf(participant, "id"),
                            PhoneId: WahaJson.TextOf(participant, "pn"),
                            Role: WahaJson.TextOf(participant, "role")
                        )
                    )
                    .Select(participant =>
                        participant.Id is { } id
                            ? new WahaParticipant(
                                id,
                                participant.PhoneId,
                                participant.Role is "admin" or "superadmin"
                            )
                            : null
                    )
                    .OfType<WahaParticipant>(),
            ]
            : [];

    private sealed record SessionCreation(string Name, bool Start = true);

    private sealed record PairingCodeRequest(string PhoneNumber);

    private sealed record TextMessage(
        string Session,
        string ChatId,
        string Text,
        [property: JsonPropertyName("reply_to")] string? ReplyTo,
        IReadOnlyList<string>? Mentions
    );

    private sealed record MessageFile(
        [property: JsonPropertyName("mimetype")] string MimeType,
        [property: JsonPropertyName("filename")] string FileName,
        string Data
    );

    private sealed record ImageMessage(
        string Session,
        string ChatId,
        MessageFile File,
        string Caption,
        [property: JsonPropertyName("reply_to")] string? ReplyTo,
        IReadOnlyList<string>? Mentions
    );

    private sealed record PollContent(
        string Name,
        IReadOnlyList<string> Options,
        bool MultipleAnswers
    );

    private sealed record PollMessage(
        string Session,
        string ChatId,
        PollContent Poll,
        [property: JsonPropertyName("reply_to")] string? ReplyTo
    );

    private sealed record EventLocation(string Name);

    private sealed record EventContent(
        string Name,
        string? Description,
        long StartTime,
        long? EndTime,
        EventLocation? Location,
        bool ExtraGuestsAllowed
    );

    private sealed record EventMessage(
        string ChatId,
        EventContent Event,
        [property: JsonPropertyName("reply_to")] string? ReplyTo
    );

    private sealed record EditedText(string Text);

    private sealed record ParticipantId(string Id);

    private sealed record ParticipantsChange(IReadOnlyList<ParticipantId> Participants);
}
