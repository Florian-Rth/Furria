using Furria.Core.Assistant;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantSettingsQuery
{
    public static async Task<ClubAssistantSettings> ClubAssistantSettingsAsync(
        this AppDbContext dbContext,
        CancellationToken ct
    ) =>
        await dbContext
            .ClubAssistantSettingsRows.AsNoTracking()
            .SingleOrDefaultAsync(row => row.Id == ClubAssistantSettings.TheOnlyId, ct)
        ?? new ClubAssistantSettings();
}
