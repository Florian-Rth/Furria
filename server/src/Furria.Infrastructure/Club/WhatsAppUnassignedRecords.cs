using Furria.Application.Club;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class WhatsAppUnassignedRecords
{
    private const string PhonePrefix = "+";

    private static readonly ILookup<int, WhatsAppUnassignedAnswer> NoAnswers = Array
        .Empty<WhatsAppUnassignedAnswer>()
        .ToLookup(_ => 0);

    internal static async Task<ILookup<int, WhatsAppUnassignedVote>> UnassignedVotesOfPollsAsync(
        this AppDbContext dbContext,
        IReadOnlyList<int> pollIds,
        CancellationToken ct
    )
    {
        if (pollIds.Count == 0)
            return Array.Empty<WhatsAppUnassignedVote>().ToLookup(_ => 0);

        var votes = await dbContext
            .WhatsAppAnswers.AsNoTracking()
            .Where(answer =>
                answer.PersonId == null
                && answer.PollOptionIds.Count > 0
                && answer.WhatsAppMessage!.AddOnKind == WhatsAppAddOnKind.Poll
                && pollIds.Contains(answer.WhatsAppMessage.AddOnId!.Value)
            )
            .OrderBy(answer => answer.AnsweredAt)
            .ThenBy(answer => answer.Id)
            .Select(answer => new
            {
                PollId = answer.WhatsAppMessage!.AddOnId!.Value,
                answer.SenderName,
                answer.SenderPhone,
                answer.PollOptionIds,
            })
            .ToListAsync(ct);

        return votes.ToLookup(
            vote => vote.PollId,
            vote => new WhatsAppUnassignedVote
            {
                WhatsAppName = vote.SenderName,
                Phone = PhoneOf(vote.SenderPhone),
                OptionIds = vote.PollOptionIds,
            }
        );
    }

    internal static async Task<ILookup<int, WhatsAppUnassignedAnswer>> UnassignedAttendanceAsync(
        this AppDbContext dbContext,
        WhatsAppHostKind hostKind,
        IReadOnlyList<int> hostIds,
        CancellationToken ct
    )
    {
        if (hostIds.Count == 0)
            return NoAnswers;

        var answers = await dbContext
            .WhatsAppAnswers.AsNoTracking()
            .Where(answer =>
                answer.PersonId == null
                && answer.Attendance != null
                && answer.WhatsAppMessage!.AddOnKind == WhatsAppAddOnKind.Attendance
                && answer.WhatsAppMessage.HostKind == hostKind
                && hostIds.Contains(answer.WhatsAppMessage.HostId)
            )
            .OrderBy(answer => answer.AnsweredAt)
            .ThenBy(answer => answer.Id)
            .Select(answer => new
            {
                answer.WhatsAppMessage!.HostId,
                answer.SenderName,
                answer.SenderPhone,
                Attendance = answer.Attendance!.Value,
            })
            .ToListAsync(ct);

        return answers.ToLookup(
            answer => answer.HostId,
            answer => new WhatsAppUnassignedAnswer
            {
                WhatsAppName = answer.SenderName,
                Phone = PhoneOf(answer.SenderPhone),
                Answer = answer.Attendance,
            }
        );
    }

    private static string? PhoneOf(string? digits) => digits is null ? null : PhonePrefix + digits;
}
