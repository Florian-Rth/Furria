using System.Diagnostics;
using Furria.Application.Results;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class CalendarService
{
    private async Task<Result?> AddOnSightRefusalAsync(AddOnSight sight, CancellationToken ct)
    {
        var rights = await RightsOfAsync(sight.ActorAccountId, ct);
        var unseen = rights.HoldsClubRead
            ? Result.NotFound(sight.UnknownMessage)
            : Result.Forbidden(sight.NotYoursMessage);

        return sight.Host switch
        {
            CalendarEntryAddOnHost entry => await EntryAddOnRefusalAsync(
                sight,
                new EntrySight(entry, rights, unseen),
                ct
            ),
            null => unseen,
            _ => throw new UnreachableException(),
        };
    }

    private async Task<Result?> EntryAddOnRefusalAsync(
        AddOnSight sight,
        EntrySight entrySight,
        CancellationToken ct
    )
    {
        var facts = (
            await _dbContext
                .CalendarEntries.AsNoTracking()
                .Where(entry => entry.Id == entrySight.Host.CalendarEntryId)
                .Select(EntryFactsRows.Projection)
                .SingleAsync(ct)
        ).ToFacts();
        var ties = await _dbContext.CalendarTiesOfAsync(
            sight.PersonId,
            ClubClock.Today(_timeProvider),
            ct
        );

        if (!ties.Sees(facts, entrySight.Rights))
            return entrySight.Unseen;

        return sight.Access == AddOnAccess.Answer
            ? await AnswerRefusalAsync(sight.ActorAccountId, facts, ties, ct)
            : null;
    }

    private enum AddOnAccess
    {
        Sight,
        Answer,
    }

    private sealed record EntrySight(
        CalendarEntryAddOnHost Host,
        CalendarRights Rights,
        Result Unseen
    );

    private sealed record AddOnSight(
        int ActorAccountId,
        int PersonId,
        AddOnHost? Host,
        string UnknownMessage,
        string NotYoursMessage,
        AddOnAccess Access
    );
}
