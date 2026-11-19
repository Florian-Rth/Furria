using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Intakes;

public sealed partial class IntakeService
{
    private static readonly TimeSpan LapsedPortraitGrace = TimeSpan.FromHours(1);

    public async Task PurgeLapsedAsync(CancellationToken ct)
    {
        var now = _timeProvider.GetUtcNow();
        var lapsedBefore = now - LapsedPortraitGrace;
        await _dbContext
            .Intakes.Where(intake =>
                intake.TokenSeed != null && intake.SubmittedAt == null && intake.ExpiresAt <= now
            )
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(intake => intake.TokenSeed, _ => null)
                        .SetProperty(intake => intake.UpdatedAt, now),
                ct
            );
        await _dbContext
            .MediaItems.Where(item =>
                item.OwnerIntakeId != null
                && !_dbContext.Intakes.Any(intake =>
                    intake.Id == item.OwnerIntakeId
                    && intake.DiscardedAt == null
                    && intake.CompletedAt == null
                    && (intake.SubmittedAt != null || intake.ExpiresAt > lapsedBefore)
                )
            )
            .ExecuteDeleteAsync(ct);
    }
}
