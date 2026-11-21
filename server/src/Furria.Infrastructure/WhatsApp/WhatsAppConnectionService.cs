using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Results;
using Furria.Application.WhatsApp;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppConnectionService
{
    private const string NotScanningMessage = "Der Bot wartet gerade nicht auf eine Verknüpfung.";
    private const string NoQrCodeMessage = "WhatsApp hat noch keinen QR-Code bereit.";
    private const string NoPairingCodeMessage = "WhatsApp hat keinen Kopplungscode geliefert.";

    private static readonly StringComparer GroupNameOrder = StringComparer.Create(
        CultureInfo.GetCultureInfo("de-DE"),
        ignoreCase: true
    );

    private static readonly WhatsAppOverviewDetails SwitchedOff = new(
        WhatsAppConnectionState.Off,
        null,
        null,
        []
    );

    private readonly AppDbContext _dbContext;
    private readonly WahaClient _waha;
    private readonly IOptions<WhatsAppOptions> _options;

    public WhatsAppConnectionService(
        AppDbContext dbContext,
        WahaClient waha,
        IOptions<WhatsAppOptions> options
    )
    {
        _dbContext = dbContext;
        _waha = waha;
        _options = options;
    }

    public async Task<WhatsAppOverviewDetails> OverviewAsync(CancellationToken ct)
    {
        if (!_options.Value.IsConfigured)
            return SwitchedOff;

        var clubGroup = await ClubGroupAsync(ct);
        var session = await WahaReach.TryAsync(() => _waha.SessionAsync(ct), ct);
        if (session is null)
            return new WhatsAppOverviewDetails(
                WhatsAppConnectionState.Unreachable,
                null,
                clubGroup,
                []
            );

        var state = StateOf(session.Value);
        var groups =
            state == WhatsAppConnectionState.Working
                ? await WahaReach.TryAsync(() => _waha.GroupsAsync(ct), ct)
                : null;

        return new WhatsAppOverviewDetails(
            state,
            session.Value?.AccountId is { } accountId
                ? WhatsAppPhoneNumbers.PhoneOfAccountId(accountId)
                : null,
            clubGroup,
            SummariesOf(groups?.Value ?? [])
        );
    }

    public async Task<Result> StartLinkingAsync(CancellationToken ct)
    {
        if (!_options.Value.IsConfigured)
            return Result.Conflict(WhatsAppMessages.SwitchedOff);

        var session = await WahaReach.TryAsync(() => _waha.SessionAsync(ct), ct);
        if (session is null)
            return Result.Conflict(WhatsAppMessages.Unreachable);

        var started = await WahaReach.TryAsync(() => StartAsync(session.Value, ct), ct);
        return started is null ? Result.Conflict(WhatsAppMessages.Unreachable) : Result.Success();
    }

    public async Task<Result<string>> QrCodeAsync(CancellationToken ct)
    {
        var scanning = await ScanningAsync(ct);
        if (!scanning.IsSuccess)
            return Result<string>.Carrying(scanning);

        var qrCode = await WahaReach.TryAsync(() => _waha.QrCodeAsync(ct), ct);
        if (qrCode is null)
            return Result<string>.Conflict(WhatsAppMessages.Unreachable);

        return qrCode.Value is { } value
            ? Result<string>.Success(value)
            : Result<string>.Conflict(NoQrCodeMessage);
    }

    public async Task<Result<string>> PairingCodeAsync(string phoneNumber, CancellationToken ct)
    {
        if (WhatsAppPhoneNumbers.InternationalDigitsOf(phoneNumber) is not { } digits)
            return Result<string>.Validation(WhatsAppPhoneNumbers.InvalidMessage);

        var scanning = await ScanningAsync(ct);
        if (!scanning.IsSuccess)
            return Result<string>.Carrying(scanning);

        var code = await WahaReach.TryAsync(() => _waha.RequestPairingCodeAsync(digits, ct), ct);
        if (code is null)
            return Result<string>.Conflict(WhatsAppMessages.Unreachable);

        return code.Value is { } value
            ? Result<string>.Success(value)
            : Result<string>.Conflict(NoPairingCodeMessage);
    }

    private async Task<Result> ScanningAsync(CancellationToken ct)
    {
        if (!_options.Value.IsConfigured)
            return Result.Conflict(WhatsAppMessages.SwitchedOff);

        var session = await WahaReach.TryAsync(() => _waha.SessionAsync(ct), ct);
        if (session is null)
            return Result.Conflict(WhatsAppMessages.Unreachable);

        return StateOf(session.Value) == WhatsAppConnectionState.ScanQrCode
            ? Result.Success()
            : Result.Conflict(NotScanningMessage);
    }

    private Task StartAsync(WahaSessionInfo? session, CancellationToken ct) =>
        session is null
            ? _waha.CreateSessionAsync(ct)
            : session.Status switch
            {
                WhatsAppSessionStatus.Stopped => _waha.StartSessionAsync(ct),
                WhatsAppSessionStatus.Failed => _waha.RestartSessionAsync(ct),
                _ => Task.CompletedTask,
            };

    private Task<WhatsAppClubGroupDetails?> ClubGroupAsync(CancellationToken ct) =>
        _dbContext
            .LinkedWhatsAppGroups.AsNoTracking()
            .Where(link => link.GroupId == null)
            .Select(link => new WhatsAppClubGroupDetails(
                link.ChatId,
                link.KeepsMembers,
                link.InviteLink
            ))
            .FirstOrDefaultAsync(ct);

    [Pure]
    private static WhatsAppConnectionState StateOf(WahaSessionInfo? session) =>
        session is null
            ? WhatsAppConnectionState.Stopped
            : session.Status switch
            {
                WhatsAppSessionStatus.Stopped => WhatsAppConnectionState.Stopped,
                WhatsAppSessionStatus.ScanQrCode => WhatsAppConnectionState.ScanQrCode,
                WhatsAppSessionStatus.Working => WhatsAppConnectionState.Working,
                WhatsAppSessionStatus.Failed => WhatsAppConnectionState.Failed,
                _ => WhatsAppConnectionState.Starting,
            };

    [Pure]
    private static IReadOnlyList<WhatsAppGroupSummary> SummariesOf(
        IReadOnlyList<WahaGroup> groups
    ) =>
        [
            .. groups
                .Select(group => new WhatsAppGroupSummary(group.ChatId, group.Name))
                .OrderBy(group => group.Name, GroupNameOrder),
        ];
}
