using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Furria.Application.WhatsApp;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppGroupKeeping
{
    private const string NoClubGroupMessage = "Wähle zuerst die Vereinsgruppe.";

    private readonly AppDbContext _dbContext;
    private readonly WahaClient _waha;
    private readonly WhatsAppSenderMatch _senders;
    private readonly IOptions<WhatsAppOptions> _options;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<WhatsAppGroupKeeping> _logger;

    public WhatsAppGroupKeeping(
        AppDbContext dbContext,
        WahaClient waha,
        WhatsAppSenderMatch senders,
        IOptions<WhatsAppOptions> options,
        TimeProvider timeProvider,
        ILogger<WhatsAppGroupKeeping> logger
    )
    {
        _dbContext = dbContext;
        _waha = waha;
        _senders = senders;
        _options = options;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task<Result> SwitchAsync(bool keepsMembers, CancellationToken ct)
    {
        if (!_options.Value.IsConfigured)
            return Result.Conflict(WhatsAppMessages.SwitchedOff);

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        if (await LockedClubLinkAsync(ct) is not { } link)
            return Result.Conflict(NoClubGroupMessage);

        link.KeepsMembers = keepsMembers;
        if (!keepsMembers)
            await WithdrawWaitingAddsAsync(link.ChatId, ct);

        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Result.Success();
    }

    public async Task<bool> IsOnAsync(CancellationToken ct) =>
        _options.Value.IsConfigured && await KeptChatIdAsync(ct) is not null;

    public async Task StageAddsAsync(CancellationToken ct)
    {
        if (!_options.Value.IsConfigured || await KeptChatIdAsync(ct) is not { } chatId)
            return;

        var participants = await WahaReach.TryAsync(() => _waha.ParticipantsAsync(chatId, ct), ct);
        if (participants is null)
            return;

        var digitsInGroup = await DigitsOfAsync(
            participants.Value.Select(participant => participant.PhoneId ?? participant.Id),
            ct
        );
        await StageAsync(chatId, digitsInGroup, ct);
        await FetchInviteLinkForRefusedAsync(chatId, ct);
    }

    public async Task RecordJoinAsync(InboxWhatsAppEvent inboxEvent, CancellationToken ct)
    {
        if (inboxEvent.Session != _options.Value.Session)
            return;
        if (WahaParticipantsEvents.Read(inboxEvent.Body) is not { IsJoin: true } joined)
            return;

        var digits = await DigitsOfAsync(joined.ParticipantIds, ct);
        if (digits.Count == 0 || await LockedClubLinkAsync(ct) is not { } link)
            return;
        if (link.ChatId != joined.GroupChatId)
            return;

        var joinedPeople = await PeopleWithDigitsAsync(digits, ct);
        await SettleAsync(
            link.ChatId,
            [
                .. joinedPeople.Select(person => new WhatsAppKeepingStep(
                    person.PersonId,
                    person.Digits,
                    WhatsAppGroupAddState.InGroup
                )),
            ],
            ct
        );
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task RecordAddAsync(
        OutboxWhatsApp operation,
        WahaAddOutcome outcome,
        CancellationToken ct
    )
    {
        var add = await _dbContext.WhatsAppGroupAdds.SingleOrDefaultAsync(
            row =>
                row.ChatId == operation.ChatId
                && row.PersonId == operation.HostId
                && row.State == WhatsAppGroupAddState.Requested,
            ct
        );
        if (add is null)
            return;

        add.State =
            outcome == WahaAddOutcome.Refused
                ? WhatsAppGroupAddState.Refused
                : WhatsAppGroupAddState.InGroup;
        add.ChangedAt = _timeProvider.GetUtcNow();
        if (add.State == WhatsAppGroupAddState.Refused)
            _logger.LogWarning(
                "WhatsApp refused adding person {PersonId} to {ChatId}; she is offered the invite",
                add.PersonId,
                add.ChatId
            );
    }

    private async Task StageAsync(
        string chatId,
        IReadOnlySet<string> digitsInGroup,
        CancellationToken ct
    )
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        var link = await LockedClubLinkAsync(ct);
        if (link is not { KeepsMembers: true } || link.ChatId != chatId)
            return;

        var addsWaiting = await HasAddsWaitingAsync(chatId, ct);
        var steps = WhatsAppKeepingPlan
            .Of(await CandidatesAsync(chatId, ct), digitsInGroup)
            .Where(step => !addsWaiting || step.State != WhatsAppGroupAddState.Requested)
            .ToList();
        await SettleAsync(chatId, steps, ct);
        var now = _timeProvider.GetUtcNow();
        _dbContext.OutboxWhatsApps.AddRange(
            steps
                .Where(step => step.State == WhatsAppGroupAddState.Requested)
                .Select(step => AddOperationOf(chatId, step, now))
        );
        await _dbContext.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
    }

    private async Task SettleAsync(
        string chatId,
        IReadOnlyList<WhatsAppKeepingStep> steps,
        CancellationToken ct
    )
    {
        var personIds = steps.Select(step => step.PersonId).ToList();
        var held = await _dbContext
            .WhatsAppGroupAdds.Where(add =>
                add.ChatId == chatId && personIds.Contains(add.PersonId)
            )
            .ToDictionaryAsync(add => add.PersonId, ct);
        var now = _timeProvider.GetUtcNow();
        foreach (var step in steps)
        {
            var add = held.GetValueOrDefault(step.PersonId) ?? Added(chatId, step.PersonId);
            add.PhoneDigits = step.PhoneDigits;
            add.State = step.State;
            add.ChangedAt = now;
        }
    }

    private WhatsAppGroupAdd Added(string chatId, int personId)
    {
        var add = new WhatsAppGroupAdd { ChatId = chatId, PersonId = personId };
        _dbContext.WhatsAppGroupAdds.Add(add);
        return add;
    }

    [Pure]
    private static OutboxWhatsApp AddOperationOf(
        string chatId,
        WhatsAppKeepingStep step,
        DateTimeOffset now
    ) =>
        new()
        {
            ChatId = chatId,
            Operation = WhatsAppOperation.AddParticipant,
            HostKind = WhatsAppHostKind.Person,
            HostId = step.PersonId,
            Text = WhatsAppKeepingPlan.ParticipantIdOf(step.PhoneDigits),
            EnqueuedAt = now,
        };

    private async Task<IReadOnlyList<WhatsAppKeepingCandidate>> CandidatesAsync(
        string chatId,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(_timeProvider);
        var people = await _dbContext
            .People.AsNoTracking()
            .Where(person =>
                person.ClubGroupConsent && person.Phone != null && person.ArchivedOn == null
            )
            .Where(_dbContext.IsActiveInClubOn(today))
            .Select(person => new { person.Id, person.Phone })
            .ToListAsync(ct);
        var held = await HeldAddsAsync(chatId, ct);

        return
        [
            .. people.Select(person =>
                held.GetValueOrDefault(person.Id) is { } add
                    ? new WhatsAppKeepingCandidate(
                        person.Id,
                        person.Phone!,
                        add.PhoneDigits,
                        add.State
                    )
                    : new WhatsAppKeepingCandidate(person.Id, person.Phone!, null, null)
            ),
        ];
    }

    private async Task<Dictionary<int, WhatsAppGroupAdd>> HeldAddsAsync(
        string chatId,
        CancellationToken ct
    )
    {
        var failedAddsOf = _dbContext
            .OutboxWhatsApps.Where(operation =>
                operation.ChatId == chatId
                && operation.Operation == WhatsAppOperation.AddParticipant
                && operation.FailedAt != null
            )
            .Select(operation => operation.HostId);

        return await _dbContext
            .WhatsAppGroupAdds.AsNoTracking()
            .Where(add =>
                add.ChatId == chatId
                && (
                    add.State != WhatsAppGroupAddState.Requested
                    || failedAddsOf.Contains(add.PersonId)
                )
            )
            .ToDictionaryAsync(add => add.PersonId, ct);
    }

    private async Task<IReadOnlyList<(int PersonId, string Digits)>> PeopleWithDigitsAsync(
        IReadOnlySet<string> digits,
        CancellationToken ct
    )
    {
        var people = await _dbContext
            .People.AsNoTracking()
            .Where(person => person.Phone != null && person.ArchivedOn == null)
            .Select(person => new { person.Id, person.Phone })
            .ToListAsync(ct);

        return
        [
            .. people
                .Select(person =>
                    (
                        PersonId: person.Id,
                        Digits: WhatsAppPhoneNumbers.InternationalDigitsOf(person.Phone!)
                    )
                )
                .Where(person => person.Digits is not null && digits.Contains(person.Digits))
                .Select(person => (person.PersonId, person.Digits!)),
        ];
    }

    private async Task<IReadOnlySet<string>> DigitsOfAsync(
        IEnumerable<string> participantIds,
        CancellationToken ct
    )
    {
        var digits = new HashSet<string>(StringComparer.Ordinal);
        foreach (var participantId in participantIds)
            if (await PhoneDigitsOfAsync(participantId, ct) is { } phoneDigits)
                digits.Add(phoneDigits);

        return digits;
    }

    private async Task<string?> PhoneDigitsOfAsync(string participantId, CancellationToken ct) =>
        (await WahaReach.TryAsync(() => _senders.PhoneDigitsOfAsync(participantId, ct), ct))?.Value;

    public async Task FetchInviteLinkForRefusedAsync(string chatId, CancellationToken ct)
    {
        if (
            await _dbContext.WhatsAppGroupAdds.AnyAsync(
                add => add.ChatId == chatId && add.State == WhatsAppGroupAddState.Refused,
                ct
            )
        )
            await FetchMissingInviteLinkAsync(chatId, ct);
    }

    private async Task FetchMissingInviteLinkAsync(string chatId, CancellationToken ct)
    {
        if (
            !await _dbContext.LinkedWhatsAppGroups.AnyAsync(
                link => link.ChatId == chatId && link.InviteLink == null,
                ct
            )
        )
            return;

        var inviteLink = await WahaReach.TryAsync(() => _waha.InviteLinkAsync(chatId, ct), ct);
        if (inviteLink?.Value is { } link)
            await _dbContext
                .LinkedWhatsAppGroups.Where(row => row.ChatId == chatId)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(row => row.InviteLink, link),
                    ct
                );
    }

    private Task<string?> KeptChatIdAsync(CancellationToken ct) =>
        _dbContext
            .LinkedWhatsAppGroups.AsNoTracking()
            .Where(link => link.GroupId == null && link.KeepsMembers)
            .Select(link => link.ChatId)
            .SingleOrDefaultAsync(ct);

    private Task<bool> HasAddsWaitingAsync(string chatId, CancellationToken ct) =>
        _dbContext.OutboxWhatsApps.AnyAsync(
            operation =>
                operation.ChatId == chatId
                && operation.Operation == WhatsAppOperation.AddParticipant
                && operation.FailedAt == null,
            ct
        );

    private Task<LinkedWhatsAppGroup?> LockedClubLinkAsync(CancellationToken ct) =>
        _dbContext
            .LinkedWhatsAppGroups.FromSql(
                $"SELECT * FROM linked_whatsapp_group WHERE group_id IS NULL FOR UPDATE"
            )
            .SingleOrDefaultAsync(ct);

    private async Task WithdrawWaitingAddsAsync(string chatId, CancellationToken ct)
    {
        await _dbContext
            .OutboxWhatsApps.Where(operation =>
                operation.ChatId == chatId
                && operation.Operation == WhatsAppOperation.AddParticipant
            )
            .ExecuteDeleteAsync(ct);
        await _dbContext
            .WhatsAppGroupAdds.Where(add =>
                add.ChatId == chatId && add.State == WhatsAppGroupAddState.Requested
            )
            .ExecuteDeleteAsync(ct);
    }
}
