using Furria.Application.Intakes;
using Furria.Core.Identity;
using Furria.Core.Intakes;
using Furria.Core.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Intakes;

public sealed partial class IntakeService
{
    public async Task<IntakePortraitPass?> PortraitPassOfAsync(string token, CancellationToken ct)
    {
        if (IntakeTokens.HashOfPresented(token) is not { } tokenHash)
            return null;

        var link = await _dbContext
            .Intakes.AsNoTracking()
            .Where(intake => intake.TokenHash == tokenHash)
            .Select(intake => new
            {
                intake.Id,
                intake.DiscardedAt,
                intake.CompletedAt,
                intake.SubmittedAt,
                intake.ExpiresAt,
            })
            .SingleOrDefaultAsync(ct);

        return link is null
            ? null
            : new IntakePortraitPass(
                link.Id,
                Intake.StateOf(
                    link.DiscardedAt,
                    link.CompletedAt,
                    link.SubmittedAt,
                    link.ExpiresAt,
                    _timeProvider.GetUtcNow()
                ) == IntakeState.Open
            );
    }

    private async Task HandPortraitToAsync(int intakeId, Person person, CancellationToken ct)
    {
        var portraits = await PortraitsOfAsync(intakeId, ct);
        if (portraits.Count == 0)
            return;

        var latest = portraits.MaxBy(item => item.Id)!;
        _dbContext.MediaItems.RemoveRange(portraits.Where(item => item != latest));
        if (person.PortraitId is null)
        {
            latest.OwnerKind = MediaOwnerKind.Person;
            latest.OwnerIntakeId = null;
            latest.OwnerPersonId = person.Id;
            person.PortraitId = latest.Id;
        }
        else
            _dbContext.MediaItems.Remove(latest);

        await _dbContext.SaveChangesAsync(ct);
    }

    private Task DropPortraitsOfAsync(int intakeId, CancellationToken ct) =>
        _dbContext.MediaItems.Where(item => item.OwnerIntakeId == intakeId).ExecuteDeleteAsync(ct);

    private Task<List<MediaItem>> PortraitsOfAsync(int intakeId, CancellationToken ct) =>
        _dbContext
            .MediaItems.Where(item =>
                item.OwnerKind == MediaOwnerKind.Intake && item.OwnerIntakeId == intakeId
            )
            .ToListAsync(ct);
}
