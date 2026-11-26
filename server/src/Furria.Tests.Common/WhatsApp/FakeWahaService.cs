using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;

namespace Furria.Tests.Common.WhatsApp;

public sealed class FakeWahaService : HttpMessageHandler
{
    public const string ScanningQrValue = "2@fake-waha-qr,linking";
    public const string PairingCode = "ABCD-EFGH";
    public const string InviteLink = "https://chat.whatsapp.com/FakeInvite";

    private const string ScanningStatus = "SCAN_QR_CODE";
    private const string WorkingStatus = "WORKING";

    private readonly ConcurrentDictionary<string, string> _groups = new();
    private readonly ConcurrentDictionary<string, string> _contactNames = new();
    private readonly ConcurrentDictionary<string, string> _lidPhones = new();
    private readonly ConcurrentQueue<FakeWahaSend> _sent = new();
    private readonly ConcurrentQueue<string> _typedIn = new();
    private readonly ConcurrentDictionary<
        string,
        ConcurrentDictionary<string, string?>
    > _participants = new();
    private readonly Lock _sessionLock = new();
    private string? _sessionStatus;
    private string? _botAccountId;
    private int _sentCount;
    private (HttpStatusCode Status, string Body)? _sendRefusal;

    public IReadOnlyList<FakeWahaSend> Sent => [.. _sent];

    public IReadOnlyList<string> TypedIn => [.. _typedIn];

    public void JoinGroup(string chatId, string name) => _groups[chatId] = name;

    public void SeatParticipant(string groupChatId, string participantId, string? phoneId = null) =>
        _participants.GetOrAdd(groupChatId, _ => new())[participantId] = phoneId;

    public void Unseat(string groupChatId, string participantId) =>
        _participants.GetOrAdd(groupChatId, _ => new()).TryRemove(participantId, out _);

    public void KnowContact(string contactId, string pushName) =>
        _contactNames[contactId] = pushName;

    public void KnowLid(string lid, string phoneId) => _lidPhones[lid] = phoneId;

    public void RefuseSends(HttpStatusCode status, string body)
    {
        lock (_sessionLock)
            _sendRefusal = (status, body);
    }

    public void LinkBot(string botAccountId)
    {
        lock (_sessionLock)
        {
            _sessionStatus = WorkingStatus;
            _botAccountId = botAccountId;
        }
    }

    public void Forget()
    {
        _groups.Clear();
        _contactNames.Clear();
        _lidPhones.Clear();
        _sent.Clear();
        _typedIn.Clear();
        _participants.Clear();
        lock (_sessionLock)
        {
            _sendRefusal = null;
            _sessionStatus = null;
            _botAccountId = null;
        }
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        var path = request.RequestUri?.AbsolutePath ?? "";
        var body = request.Content is null
            ? ""
            : await request.Content.ReadAsStringAsync(cancellationToken);
        if (request.Method == HttpMethod.Get && Route(path) is "lids" or "contacts")
            return Lookup(Route(path), path, request.RequestUri?.Query ?? "");

        lock (_sessionLock)
            return Answer(request.Method, path, body);
    }

    private HttpResponseMessage Lookup(string route, string path, string query) =>
        route == "lids"
            ? PhoneOfLid(Uri.UnescapeDataString(path[(path.LastIndexOf('/') + 1)..]))
            : ContactOf(ContactIdOf(query));

    private HttpResponseMessage PhoneOfLid(string lid) =>
        Json(JsonSerializer.Serialize(new { lid, pn = _lidPhones.GetValueOrDefault(lid) }));

    private HttpResponseMessage ContactOf(string contactId) =>
        _contactNames.TryGetValue(contactId, out var pushName)
            ? Json(JsonSerializer.Serialize(new { id = contactId, pushname = pushName }))
            : new HttpResponseMessage(HttpStatusCode.NotFound);

    private static string ContactIdOf(string query) =>
        query
            .TrimStart('?')
            .Split('&')
            .Select(pair => pair.Split('=', 2))
            .Where(pair => pair is ["contactId", _])
            .Select(pair => Uri.UnescapeDataString(pair[1]))
            .FirstOrDefault()
        ?? "";

    private HttpResponseMessage Answer(HttpMethod method, string path, string body) =>
        (method.Method, Route(path)) switch
        {
            ("GET", "groups") => Json(GroupsJson()),
            ("GET", "session") => SessionJson(),
            ("POST", "sessions" or "start" or "restart") => StartScanning(),
            ("GET", "qr") => ScanningOnly(() =>
                Json(JsonSerializer.Serialize(new { value = ScanningQrValue }))
            ),
            ("POST", "request-code") => ScanningOnly(RequestPairingCode),
            ("POST", "sendText" or "sendImage" or "sendPoll" or "events") => Send(
                Route(path),
                body
            ),
            ("POST", "startTyping") => Typing(body),
            ("POST", "stopTyping") => Json("{}"),
            ("GET", "participants") => Json(ParticipantsJson(GroupChatIdOf(path))),
            ("POST", "add-participants") => AddParticipants(GroupChatIdOf(path), body),
            ("GET", "invite-code") => Json(JsonSerializer.Serialize(InviteLink)),
            ("PUT", "message") => Change("edit", path, TextOf(body)),
            ("DELETE", "message") => Change("delete", path, ""),
            _ => new HttpResponseMessage(HttpStatusCode.NotFound),
        };

    private static string Route(string path) =>
        path switch
        {
            "/api/sessions" => "sessions",
            "/api/sendText" => "sendText",
            "/api/sendImage" => "sendImage",
            "/api/sendPoll" => "sendPoll",
            "/api/contacts" => "contacts",
            "/api/startTyping" => "startTyping",
            "/api/stopTyping" => "stopTyping",
            _ when path.Contains("/lids/", StringComparison.Ordinal) => "lids",
            _ when path.Contains("/messages/", StringComparison.Ordinal) => "message",
            _ when path.EndsWith("/participants/v2", StringComparison.Ordinal) => "participants",
            _ when path.EndsWith("/participants/add", StringComparison.Ordinal) =>
                "add-participants",
            _ when path.EndsWith("/invite-code", StringComparison.Ordinal) => "invite-code",
            _ when path.StartsWith("/api/sessions/", StringComparison.Ordinal)
                    && path.EndsWith("/start", StringComparison.Ordinal) => "start",
            _ when path.StartsWith("/api/sessions/", StringComparison.Ordinal)
                    && path.EndsWith("/restart", StringComparison.Ordinal) => "restart",
            _ when path.StartsWith("/api/sessions/", StringComparison.Ordinal) => "session",
            _ when path.EndsWith("/groups", StringComparison.Ordinal) => "groups",
            _ when path.EndsWith("/events", StringComparison.Ordinal) => "events",
            _ when path.EndsWith("/auth/qr", StringComparison.Ordinal) => "qr",
            _ when path.EndsWith("/auth/request-code", StringComparison.Ordinal) => "request-code",
            _ => "",
        };

    private HttpResponseMessage SessionJson() =>
        _sessionStatus is null
            ? new HttpResponseMessage(HttpStatusCode.NotFound)
            : Json(
                JsonSerializer.Serialize(
                    new
                    {
                        status = _sessionStatus,
                        me = _botAccountId is null ? null : new { id = _botAccountId },
                    }
                )
            );

    private HttpResponseMessage StartScanning()
    {
        _sessionStatus = ScanningStatus;
        return Json("{}");
    }

    private HttpResponseMessage ScanningOnly(Func<HttpResponseMessage> answer) =>
        _sessionStatus == ScanningStatus
            ? answer()
            : new HttpResponseMessage(HttpStatusCode.UnprocessableEntity);

    private static HttpResponseMessage RequestPairingCode() =>
        Json(JsonSerializer.Serialize(new { code = PairingCode }));

    private HttpResponseMessage Send(string kind, string body)
    {
        if (_sendRefusal is var (status, refusal))
            return new HttpResponseMessage(status)
            {
                Content = new StringContent(refusal, Encoding.UTF8, "application/json"),
            };

        using var document = JsonDocument.Parse(body);
        var root = document.RootElement;
        var chatId = root.GetProperty("chatId").GetString() ?? "";
        var messageId = $"true_{chatId}_FAKE{++_sentCount}";
        _sent.Enqueue(SentOf(kind, chatId, root, messageId));
        return Json(JsonSerializer.Serialize(new { id = messageId }));
    }

    private HttpResponseMessage Typing(string body)
    {
        using var document = JsonDocument.Parse(body);
        _typedIn.Enqueue(document.RootElement.GetProperty("chatId").GetString() ?? "");
        return Json("{}");
    }

    private HttpResponseMessage Change(string kind, string path, string text)
    {
        if (_sendRefusal is var (status, refusal))
            return new HttpResponseMessage(status)
            {
                Content = new StringContent(refusal, Encoding.UTF8, "application/json"),
            };

        var segments = path.Split('/');
        var chatId = Uri.UnescapeDataString(segments[^3]);
        var messageId = Uri.UnescapeDataString(segments[^1]);
        _sent.Enqueue(new FakeWahaSend(kind, chatId, text, [], messageId));
        return Json("{}");
    }

    private static string TextOf(string body)
    {
        using var document = JsonDocument.Parse(body);
        return document.RootElement.GetProperty("text").GetString() ?? "";
    }

    private static FakeWahaSend SentOf(
        string kind,
        string chatId,
        JsonElement root,
        string messageId
    ) =>
        kind switch
        {
            "sendPoll" => PollSentOf(chatId, root.GetProperty("poll"), messageId),
            "events" => EventSentOf(chatId, root.GetProperty("event"), messageId),
            _ => new FakeWahaSend(
                kind,
                chatId,
                (
                    kind == "sendImage" ? root.GetProperty("caption") : root.GetProperty("text")
                ).GetString() ?? "",
                MentionsOf(root),
                messageId
            )
            {
                ReplyTo = ReplyToOf(root),
            },
        };

    private static string? ReplyToOf(JsonElement root) =>
        root.TryGetProperty("reply_to", out var replyTo)
        && replyTo.ValueKind == JsonValueKind.String
            ? replyTo.GetString()
            : null;

    private static FakeWahaSend PollSentOf(string chatId, JsonElement poll, string messageId) =>
        new("sendPoll", chatId, poll.GetProperty("name").GetString() ?? "", [], messageId)
        {
            Options =
            [
                .. poll.GetProperty("options")
                    .EnumerateArray()
                    .Select(option => option.GetString() ?? ""),
            ],
            AllowsSeveralAnswers = poll.GetProperty("multipleAnswers").GetBoolean(),
        };

    private static FakeWahaSend EventSentOf(string chatId, JsonElement sent, string messageId) =>
        new("sendEvent", chatId, sent.GetProperty("name").GetString() ?? "", [], messageId)
        {
            StartTime = sent.GetProperty("startTime").GetInt64(),
            EndTime =
                sent.TryGetProperty("endTime", out var endTime)
                && endTime.ValueKind == JsonValueKind.Number
                    ? endTime.GetInt64()
                    : null,
            Place =
                sent.TryGetProperty("location", out var location)
                && location.ValueKind == JsonValueKind.Object
                    ? location.GetProperty("name").GetString()
                    : null,
        };

    private static IReadOnlyList<string> MentionsOf(JsonElement root) =>
        root.TryGetProperty("mentions", out var mentions)
        && mentions.ValueKind == JsonValueKind.Array
            ? [.. mentions.EnumerateArray().Select(mention => mention.GetString() ?? "")]
            : [];

    private static string GroupChatIdOf(string path)
    {
        var segments = path.Split('/');
        var groupsAt = Array.IndexOf(segments, "groups");
        return Uri.UnescapeDataString(segments[groupsAt + 1]);
    }

    private string ParticipantsJson(string groupChatId) =>
        JsonSerializer.Serialize(
            _participants
                .GetOrAdd(groupChatId, _ => new())
                .Select(participant => new
                {
                    id = participant.Key,
                    pn = participant.Value,
                    role = "participant",
                })
        );

    private HttpResponseMessage AddParticipants(string groupChatId, string body)
    {
        using var document = JsonDocument.Parse(body);
        var participantIds = document
            .RootElement.GetProperty("participants")
            .EnumerateArray()
            .Select(participant => participant.GetProperty("id").GetString() ?? "")
            .ToList();
        foreach (var participantId in participantIds)
        {
            _sent.Enqueue(new FakeWahaSend("add", groupChatId, participantId, [], ""));
            SeatParticipant(groupChatId, participantId);
        }

        return Json(
            JsonSerializer.Serialize(
                participantIds.Select(participantId => new { JID = participantId, Error = 0 })
            )
        );
    }

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
