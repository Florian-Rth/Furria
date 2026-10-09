using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Registry;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Identity;

internal static class StrayPersonAbsorption
{
    public static Task<bool> HoldsClubDataAsync(
        AppDbContext dbContext,
        int strayPersonId,
        CancellationToken ct
    ) => ReferencesToPersonStatements.IsReferencedByAnyBlockingAsync(dbContext, strayPersonId, ct);

    public static async Task AbsorbAsync(
        AppDbContext dbContext,
        Absorption absorption,
        CancellationToken ct
    )
    {
        await VoidLiveInvitationsAsync(dbContext, absorption, ct);
        var strayPortraitId = await PortraitIdOfAsync(dbContext, absorption.StrayPersonId, ct);
        await ReferencesToPersonStatements.MoveOntoKeeperAsync(
            dbContext,
            absorption.StrayPersonId,
            absorption.KeeperPersonId,
            ct
        );
        await HandOverPortraitAsync(dbContext, absorption, strayPortraitId, ct);
        await dbContext
            .People.Where(person => person.Id == absorption.StrayPersonId)
            .ExecuteDeleteAsync(ct);
    }

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

    private static Task<int?> PortraitIdOfAsync(
        AppDbContext dbContext,
        int personId,
        CancellationToken ct
    ) =>
        dbContext
            .People.Where(person => person.Id == personId)
            .Select(person => person.PortraitId)
            .SingleAsync(ct);

    private static async Task HandOverPortraitAsync(
        AppDbContext dbContext,
        Absorption absorption,
        int? strayPortraitId,
        CancellationToken ct
    )
    {
        if (
            strayPortraitId is not { } portraitId
            || !await dbContext.MediaItems.AnyAsync(
                item => item.Id == portraitId && item.OwnerPersonId == absorption.KeeperPersonId,
                ct
            )
        )
            return;

        await LinkPortraitAsync(dbContext, absorption.StrayPersonId, null, ct);
        await LinkPortraitAsync(dbContext, absorption.KeeperPersonId, portraitId, ct);
    }

    private static Task LinkPortraitAsync(
        AppDbContext dbContext,
        int personId,
        int? portraitId,
        CancellationToken ct
    ) =>
        dbContext
            .People.Where(person => person.Id == personId)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(person => person.PortraitId, portraitId),
                ct
            );

    internal sealed record Absorption(int StrayPersonId, int KeeperPersonId, DateTimeOffset At);
}
