using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;

namespace Furria.Tests.Common.WhatsApp;

public sealed class FakeWahaService : HttpMessageHandler
{
    public const string ScanningQrValue = "2@fake-waha-qr,linking";
    public const string PairingCode = "ABCD-EFGH";

    private const string ScanningStatus = "SCAN_QR_CODE";
    private const string WorkingStatus = "WORKING";

    private readonly ConcurrentDictionary<string, string> _groups = new();
    private readonly Lock _sessionLock = new();
    private string? _sessionStatus;
    private string? _botAccountId;
    private volatile bool _isOffline;
    private string? _pairingPhoneNumber;
    private string? _lastSessionCall;

    public string? PairingPhoneNumber
    {
        get
        {
            lock (_sessionLock)
                return _pairingPhoneNumber;
        }
    }

    public string? LastSessionCall
    {
        get
        {
            lock (_sessionLock)
                return _lastSessionCall;
        }
    }

    public void JoinGroup(string chatId, string name) => _groups[chatId] = name;

    public void HoldSession(string status)
    {
        lock (_sessionLock)
            _sessionStatus = status;
    }

    public void LinkBot(string botAccountId)
    {
        lock (_sessionLock)
        {
            _sessionStatus = WorkingStatus;
            _botAccountId = botAccountId;
        }
    }

    public void GoOffline() => _isOffline = true;

    public void Forget()
    {
        _groups.Clear();
        lock (_sessionLock)
        {
            _sessionStatus = null;
            _botAccountId = null;
            _isOffline = false;
            _pairingPhoneNumber = null;
            _lastSessionCall = null;
        }
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken
    )
    {
        if (_isOffline)
            throw new HttpRequestException("The fake WAHA service is offline.");

        var path = request.RequestUri?.AbsolutePath ?? "";
        var body = request.Content is null
            ? ""
            : await request.Content.ReadAsStringAsync(cancellationToken);
        lock (_sessionLock)
            return Answer(request.Method, path, body);
    }

    private HttpResponseMessage Answer(HttpMethod method, string path, string body) =>
        (method.Method, Route(path)) switch
        {
            ("GET", "groups") => Json(GroupsJson()),
            ("GET", "session") => SessionJson(),
            ("POST", "sessions" or "start" or "restart") => StartScanning(Route(path)),
            ("GET", "qr") => ScanningOnly(() =>
                Json(JsonSerializer.Serialize(new { value = ScanningQrValue }))
            ),
            ("POST", "request-code") => ScanningOnly(() => RequestPairingCode(body)),
            _ => new HttpResponseMessage(HttpStatusCode.NotFound),
        };

    private static string Route(string path) =>
        path switch
        {
            "/api/sessions" => "sessions",
            _ when path.StartsWith("/api/sessions/", StringComparison.Ordinal)
                    && path.EndsWith("/start", StringComparison.Ordinal) => "start",
            _ when path.StartsWith("/api/sessions/", StringComparison.Ordinal)
                    && path.EndsWith("/restart", StringComparison.Ordinal) => "restart",
            _ when path.StartsWith("/api/sessions/", StringComparison.Ordinal) => "session",
            _ when path.EndsWith("/groups", StringComparison.Ordinal) => "groups",
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

    private HttpResponseMessage StartScanning(string call)
    {
        _lastSessionCall = call;
        _sessionStatus = ScanningStatus;
        return Json("{}");
    }

    private HttpResponseMessage ScanningOnly(Func<HttpResponseMessage> answer) =>
        _sessionStatus == ScanningStatus
            ? answer()
            : new HttpResponseMessage(HttpStatusCode.UnprocessableEntity);

    private HttpResponseMessage RequestPairingCode(string body)
    {
        using var document = JsonDocument.Parse(body);
        _pairingPhoneNumber = document.RootElement.GetProperty("phoneNumber").GetString();
        return Json(JsonSerializer.Serialize(new { code = PairingCode }));
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
