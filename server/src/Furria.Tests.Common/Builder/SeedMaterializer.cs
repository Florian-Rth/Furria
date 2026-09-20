using Furria.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Tests.Common.Builder;

internal static class SeedMaterializer
{
    internal static async Task<SeededRegistry> MaterializeAsync(
        IServiceScopeFactory scopeFactory,
        SeedContextBuilder recorded,
        string password,
        CancellationToken ct
    )
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var identity = await IdentitySeedMaterializer.InsertAsync(
            scope.ServiceProvider,
            dbContext,
            recorded.RecordedIdentity,
            password,
            ct
        );
        var groups = await GroupSeedMaterializer.InsertAsync(
            dbContext,
            recorded.RecordedGroups,
            identity.PersonIds,
            ct
        );
        var roles = await RoleSeedMaterializer.InsertAsync(
            dbContext,
            recorded.RecordedRoles,
            identity.PersonIds,
            ct
        );

        var club = await ClubSeedMaterializer.InsertAsync(
            dbContext,
            recorded.RecordedClub,
            identity.PersonIds,
            groups.GroupIds,
            roles.RoleIds,
            ct
        );

        return new SeededRegistry(identity, groups, roles, club);
    }
}
