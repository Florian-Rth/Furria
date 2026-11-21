using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.WhatsApp;

public static class WhatsAppOutboxRows
{
    [Pure]
    public static OutboxWhatsApp PostOf(
        WhatsAppAddressedHost addressed,
        WhatsAppPostContent post
    ) =>
        new()
        {
            ChatId = addressed.ChatId,
            Operation = WhatsAppOperation.PostText,
            HostKind = addressed.Host.Kind,
            HostId = addressed.Host.Id,
            Text = post.Text,
            Mentions = [.. post.MentionedChatIds],
            EnqueuedAt = addressed.EnqueuedAt,
        };

    [Pure]
    public static OutboxWhatsApp AddOnOf(
        WhatsAppAddressedHost addressed,
        WhatsAppAddOnMessage message
    )
    {
        var operation = new OutboxWhatsApp
        {
            ChatId = addressed.ChatId,
            HostKind = addressed.Host.Kind,
            HostId = addressed.Host.Id,
            EnqueuedAt = addressed.EnqueuedAt,
        };
        Carry(operation, message);
        return operation;
    }

    [Pure]
    public static OutboxWhatsApp TargetingOf(
        WhatsAppAddressedHost addressed,
        WhatsAppTargeting targeting
    ) =>
        new()
        {
            ChatId = addressed.ChatId,
            Operation = targeting.Operation,
            HostKind = addressed.Host.Kind,
            HostId = addressed.Host.Id,
            Text = targeting.Text,
            TargetMessageId = targeting.MessageId,
            EnqueuedAt = addressed.EnqueuedAt,
        };

    public static void Carry(OutboxWhatsApp operation, WhatsAppAddOnMessage message)
    {
        operation.Operation = message.Operation;
        operation.Text = message.Text;
        operation.PollOptions = [.. message.PollOptions];
        operation.PollOptionIds = [.. message.PollOptionIds];
        operation.AllowsSeveralAnswers = message.AllowsSeveralAnswers;
        operation.EventStartsAt = message.EventSlot?.StartsAt;
        operation.EventEndsAt = message.EventSlot?.EndsAt;
        operation.EventPlace = message.EventSlot?.VenueName;
        operation.AddOnKind = message.AddOnKind;
        operation.AddOnId = message.AddOnId;
    }
}
