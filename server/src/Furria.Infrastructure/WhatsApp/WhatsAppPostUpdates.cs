using System.Diagnostics.Contracts;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppPostUpdates
{
    private static readonly TimeSpan EditWindowWithMargin = TimeSpan.FromMinutes(14);
    private static readonly TimeSpan DeleteWindow = TimeSpan.FromDays(2);

    private readonly AppDbContext _dbContext;
    private readonly WhatsAppPosts _posts;
    private readonly TimeProvider _timeProvider;

    public WhatsAppPostUpdates(
        AppDbContext dbContext,
        WhatsAppPosts posts,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _posts = posts;
        _timeProvider = timeProvider;
    }

    public async Task KeepAnnouncementInStepAsync(Announcement announcement, CancellationToken ct)
    {
        var host = new WhatsAppHost(WhatsAppHostKind.Announcement, announcement.Id);
        if (await TellingOfAsync(host, ct) is not { } telling)
            return;

        KeepInStep(telling, await _posts.RenderAnnouncementAsync(announcement, ct), moves: false);
        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task KeepCalendarEntryInStepAsync(
        CalendarEntry entry,
        WhatsAppEntryChange change,
        CancellationToken ct
    )
    {
        if (entry.Audience != CalendarEntryAudience.Club)
            return;

        var host = new WhatsAppHost(WhatsAppHostKind.CalendarEntry, entry.Id);
        if (await TellingOfAsync(host, ct) is not { } telling)
            return;

        KeepInStep(
            telling,
            await _posts.RenderCalendarEntryAsync(entry, change.ActorPersonId, ct),
            change.Moves
        );
        await _dbContext.SaveChangesAsync(ct);
    }

    public Task WithdrawAnnouncementAsync(int announcementId, CancellationToken ct) =>
        TakeBackAsync(new WhatsAppHost(WhatsAppHostKind.Announcement, announcementId), null, ct);

    public Task CancelCalendarEntryAsync(int calendarEntryId, CancellationToken ct) =>
        TakeBackAsync(
            new WhatsAppHost(WhatsAppHostKind.CalendarEntry, calendarEntryId),
            WhatsAppReplies.Cancelled,
            ct
        );

    private async Task<Telling?> TellingOfAsync(WhatsAppHost host, CancellationToken ct)
    {
        var waiting = await LockedWaitingOfAsync(host, ct);
        var records = await RecordsOf(host).ToListAsync(ct);

        return records.Count == 0 && waiting.Count == 0
            ? null
            : new Telling(host, records, waiting, _timeProvider.GetUtcNow());
    }

    private void KeepInStep(Telling telling, WhatsAppRenderedPost rendered, bool moves)
    {
        KeepPostText(telling, rendered.Post);
        if (moves && rendered.Slot is { } slot && telling.Post is { } post)
            Enqueue(
                telling,
                post,
                WhatsAppTargeting.ReplyTo(post.MessageId, WhatsAppReplies.Moved(slot))
            );

        var wanted = rendered.AddOns.ToDictionary(message => AddOnKeyOf(message));
        KeepSentAddOns(telling, wanted);
        KeepWaitingAddOns(telling, wanted);
        _dbContext.OutboxWhatsApps.AddRange(telling.Added);
    }

    private static void KeepPostText(Telling telling, WhatsAppPostContent post)
    {
        if (telling.Waiting.FirstOrDefault(IsPostSend) is { } waitingPost)
        {
            waitingPost.Text = post.Text;
            waitingPost.Mentions = [.. post.MentionedChatIds];
            return;
        }

        if (
            telling.Post is not { } record
            || record.Text == post.Text
            || telling.Now - record.SentAt > EditWindowWithMargin
        )
            return;

        record.Text = post.Text;
        if (telling.Waiting.FirstOrDefault(operation => IsEditOf(operation, record)) is { } edit)
            edit.Text = post.Text;
        else
            telling.Added.Add(
                TargetingOf(telling, record, WhatsAppTargeting.Edit(record.MessageId, post.Text))
            );
    }

    private void KeepSentAddOns(
        Telling telling,
        IReadOnlyDictionary<AddOnKey, WhatsAppAddOnMessage> wanted
    )
    {
        foreach (var record in telling.Records.Where(record => record.AddOnKind is not null))
        {
            var key = new AddOnKey(record.AddOnKind, record.AddOnId);
            if (!wanted.TryGetValue(key, out var message))
                Forget(telling, record);
            else if (
                !telling.Waiting.Any(operation => IsAddOnSendOf(operation, key))
                && AsksDifferently(record, message)
            )
                Repost(telling, record, message);
        }
    }

    private void KeepWaitingAddOns(
        Telling telling,
        IReadOnlyDictionary<AddOnKey, WhatsAppAddOnMessage> wanted
    )
    {
        foreach (var operation in telling.Waiting.Where(IsAddOnSend))
        {
            if (wanted.TryGetValue(AddOnKeyOf(operation), out var message))
                WhatsAppOutboxRows.Carry(operation, message);
            else
                _dbContext.OutboxWhatsApps.Remove(operation);
        }
    }

    private void Forget(Telling telling, WhatsAppMessage record)
    {
        if (IsDeletable(record, telling.Now))
            Enqueue(telling, record, WhatsAppTargeting.Delete(record.MessageId));
        _dbContext.WhatsAppMessages.Remove(record);
    }

    private static void Repost(
        Telling telling,
        WhatsAppMessage record,
        WhatsAppAddOnMessage message
    )
    {
        Enqueue(telling, record, RemovalOf(record, telling.Now, WhatsAppReplies.Replaced));
        telling.Added.Add(
            WhatsAppOutboxRows.AddOnOf(
                new WhatsAppAddressedHost(record.ChatId, telling.Host, telling.Now),
                message
            )
        );
    }

    private async Task TakeBackAsync(WhatsAppHost host, string? reply, CancellationToken ct)
    {
        await WaitingOf(host).ExecuteDeleteAsync(ct);
        var records = await RecordsOf(host).ToListAsync(ct);
        if (records.Count == 0)
            return;

        var telling = new Telling(host, records, [], _timeProvider.GetUtcNow());
        foreach (var record in records.Where(record => IsDeletable(record, telling.Now)))
            Enqueue(telling, record, WhatsAppTargeting.Delete(record.MessageId));
        if (reply is not null && telling.Post is { } post && !IsDeletable(post, telling.Now))
            Enqueue(telling, post, WhatsAppTargeting.ReplyTo(post.MessageId, reply));

        _dbContext.OutboxWhatsApps.AddRange(telling.Added);
        _dbContext.WhatsAppMessages.RemoveRange(records);
        await _dbContext.SaveChangesAsync(ct);
    }

    private static void Enqueue(
        Telling telling,
        WhatsAppMessage record,
        WhatsAppTargeting targeting
    ) => telling.Added.Add(TargetingOf(telling, record, targeting));

    private IQueryable<WhatsAppMessage> RecordsOf(WhatsAppHost host) =>
        _dbContext
            .WhatsAppMessages.Where(record =>
                record.HostKind == host.Kind && record.HostId == host.Id
            )
            .OrderBy(record => record.Id);

    private Task<List<OutboxWhatsApp>> LockedWaitingOfAsync(
        WhatsAppHost host,
        CancellationToken ct
    ) =>
        _dbContext
            .OutboxWhatsApps.FromSql(
                $"""
                SELECT * FROM outbox_whatsapp
                WHERE host_kind = {host.Kind.ToString()} AND host_id = {host.Id}
                ORDER BY id
                FOR UPDATE
                """
            )
            .ToListAsync(ct);

    private IQueryable<OutboxWhatsApp> WaitingOf(WhatsAppHost host) =>
        _dbContext
            .OutboxWhatsApps.Where(operation =>
                operation.HostKind == host.Kind && operation.HostId == host.Id
            )
            .OrderBy(operation => operation.Id);

    [Pure]
    private static OutboxWhatsApp TargetingOf(
        Telling telling,
        WhatsAppMessage record,
        WhatsAppTargeting targeting
    ) =>
        WhatsAppOutboxRows.TargetingOf(
            new WhatsAppAddressedHost(record.ChatId, telling.Host, telling.Now),
            targeting
        );

    [Pure]
    private static WhatsAppTargeting RemovalOf(
        WhatsAppMessage record,
        DateTimeOffset now,
        string reply
    ) =>
        IsDeletable(record, now)
            ? WhatsAppTargeting.Delete(record.MessageId)
            : WhatsAppTargeting.ReplyTo(record.MessageId, reply);

    [Pure]
    private static bool IsDeletable(WhatsAppMessage record, DateTimeOffset now) =>
        now - record.SentAt <= DeleteWindow;

    [Pure]
    private static bool AsksDifferently(WhatsAppMessage record, WhatsAppAddOnMessage message) =>
        !record.PollOptions.SequenceEqual(message.PollOptions)
        || !record.PollOptionIds.SequenceEqual(message.PollOptionIds);

    [Pure]
    private static bool IsPostSend(OutboxWhatsApp operation) =>
        operation.Operation == WhatsAppOperation.PostText && operation.AddOnKind is null;

    [Pure]
    private static bool IsAddOnSend(OutboxWhatsApp operation) =>
        operation.AddOnKind is not null
        && !WhatsAppOperations.Targeting.Contains(operation.Operation);

    [Pure]
    private static bool IsAddOnSendOf(OutboxWhatsApp operation, AddOnKey key) =>
        IsAddOnSend(operation) && AddOnKeyOf(operation) == key;

    [Pure]
    private static bool IsEditOf(OutboxWhatsApp operation, WhatsAppMessage record) =>
        operation.Operation == WhatsAppOperation.EditText
        && operation.TargetMessageId == record.MessageId;

    [Pure]
    private static AddOnKey AddOnKeyOf(WhatsAppAddOnMessage message) =>
        new(message.AddOnKind, message.AddOnId);

    [Pure]
    private static AddOnKey AddOnKeyOf(OutboxWhatsApp operation) =>
        new(operation.AddOnKind, operation.AddOnId);

    private sealed record AddOnKey(WhatsAppAddOnKind? Kind, int? Id);

    private sealed class Telling
    {
        public Telling(
            WhatsAppHost host,
            IReadOnlyList<WhatsAppMessage> records,
            IReadOnlyList<OutboxWhatsApp> waiting,
            DateTimeOffset now
        )
        {
            Host = host;
            Records = records;
            Waiting = waiting;
            Now = now;
        }

        public WhatsAppHost Host { get; }

        public IReadOnlyList<WhatsAppMessage> Records { get; }

        public IReadOnlyList<OutboxWhatsApp> Waiting { get; }

        public DateTimeOffset Now { get; }

        public List<OutboxWhatsApp> Added { get; } = [];

        public WhatsAppMessage? Post => Records.FirstOrDefault(record => record.AddOnKind is null);
    }
}
