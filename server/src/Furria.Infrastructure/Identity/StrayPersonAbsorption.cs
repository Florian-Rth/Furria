using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Identity;

internal static class StrayPersonAbsorption
{
    public static Task<bool> HoldsClubDataAsync(
        AppDbContext dbContext,
        int strayPersonId,
        CancellationToken ct
    ) =>
        dbContext
            .People.Where(person => person.Id == strayPersonId)
            .AnyAsync(
                person =>
                    person.Memberships.Any()
                    || person.FeeReductions.Any()
                    || person.GroupMemberships.Any()
                    || person.GroupAdminships.Any()
                    || person.RoleHoldings.Any()
                    || dbContext.BoardSeats.Any(seat => seat.PersonId == person.Id)
                    || dbContext.KeyHoldings.Any(holding => holding.PersonId == person.Id)
                    || dbContext.AttendanceResponses.Any(response => response.PersonId == person.Id)
                    || dbContext.Announcements.Any(announcement =>
                        announcement.AuthorPersonId == person.Id
                    )
                    || dbContext.NewsPosts.Any(post => post.AuthorPersonId == person.Id),
                ct
            );

    public static async Task AbsorbAsync(
        AppDbContext dbContext,
        Absorption absorption,
        CancellationToken ct
    )
    {
        await MoveAccountAsync(dbContext, absorption, ct);
        await VoidLiveInvitationsAsync(dbContext, absorption, ct);
        await RepointHistoryAsync(dbContext, absorption, ct);
        await dbContext
            .People.Where(person => person.Id == absorption.StrayPersonId)
            .ExecuteDeleteAsync(ct);
    }

    private static Task MoveAccountAsync(
        AppDbContext dbContext,
        Absorption absorption,
        CancellationToken ct
    ) =>
        dbContext
            .Users.Where(account => account.Id == absorption.AccountId)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(row => row.PersonId, absorption.KeeperPersonId),
                ct
            );

    private static Task VoidLiveInvitationsAsync(
        AppDbContext dbContext,
        Absorption absorption,
        CancellationToken ct
    ) =>
        dbContext
            .Invitations.Where(invitation =>
                invitation.PersonId == absorption.StrayPersonId
                && invitation.RedeemedAt == null
                && invitation.VoidedAt == null
            )
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(row => row.VoidedAt, absorption.At),
                ct
            );

    private static async Task RepointHistoryAsync(
        AppDbContext dbContext,
        Absorption absorption,
        CancellationToken ct
    )
    {
        var stray = absorption.StrayPersonId;
        var keeper = absorption.KeeperPersonId;

        await dbContext
            .Invitations.Where(invitation => invitation.PersonId == stray)
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.PersonId, keeper), ct);
        await dbContext
            .Invitations.Where(invitation => invitation.IssuedByPersonId == stray)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(row => row.IssuedByPersonId, keeper),
                ct
            );
        await dbContext
            .AccountEvents.Where(accountEvent => accountEvent.PersonId == stray)
            .ExecuteUpdateAsync(setters => setters.SetProperty(row => row.PersonId, keeper), ct);
        await dbContext
            .AccountEvents.Where(accountEvent => accountEvent.ActorPersonId == stray)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(row => row.ActorPersonId, keeper),
                ct
            );
        await dbContext
            .NewsPosts.Where(post => post.LastSavedByPersonId == stray)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(row => row.LastSavedByPersonId, keeper),
                ct
            );
        await dbContext
            .People.Where(person => person.ContactChangedByPersonId == stray && person.Id != stray)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(row => row.ContactChangedByPersonId, keeper),
                ct
            );
    }

    internal sealed record Absorption(
        int AccountId,
        int StrayPersonId,
        int KeeperPersonId,
        DateTimeOffset At
    );
}
