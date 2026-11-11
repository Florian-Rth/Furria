using Furria.Application.Results;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private async Task<Result?> AddOnSightRefusalAsync(AddOnSight sight, CancellationToken ct)
    {
        var rights = await RightsOfAsync(sight.ActorAccountId, ct);
        var entry = await sight
            .Entry.AsNoTracking()
            .Select(EntryFactsRows.Projection)
            .SingleOrDefaultAsync(ct);
        var ties = await _dbContext.CalendarTiesOfAsync(
            sight.PersonId,
            ClubClock.Today(_timeProvider),
            ct
        );
        var facts = entry?.ToFacts();

        if (facts is not null && ties.Sees(facts, rights))
        {
            return sight.Access == AddOnAccess.Answer
                ? await AnswerRefusalAsync(sight.ActorAccountId, facts, ties, ct)
                : null;
        }

        return rights.HoldsClubRead
            ? Result.NotFound(sight.UnknownMessage)
            : Result.Forbidden(sight.NotYoursMessage);
    }

    private enum AddOnAccess
    {
        Sight,
        Answer,
    }

    private sealed record AddOnSight(
        int ActorAccountId,
        int PersonId,
        IQueryable<CalendarEntry> Entry,
        string UnknownMessage,
        string NotYoursMessage,
        AddOnAccess Access
    );
}
