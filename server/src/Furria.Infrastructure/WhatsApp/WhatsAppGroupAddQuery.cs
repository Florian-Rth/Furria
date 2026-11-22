using Furria.Application.WhatsApp;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.WhatsApp;

public sealed class WhatsAppGroupAddQuery
{
    private readonly AppDbContext _dbContext;
    private readonly IOptions<WhatsAppOptions> _options;

    public WhatsAppGroupAddQuery(AppDbContext dbContext, IOptions<WhatsAppOptions> options)
    {
        _dbContext = dbContext;
        _options = options;
    }

    public async Task<IReadOnlyList<WhatsAppRefusedAddSummary>> RefusedAddsAsync(
        CancellationToken ct
    ) =>
        await RefusedInClubGroup()
            .OrderByDescending(add => add.ChangedAt)
            .ThenBy(add => add.PersonId)
            .Select(add => new WhatsAppRefusedAddSummary(
                add.PersonId,
                add.Person!.FirstName,
                add.Person.LastName,
                add.Person.Phone,
                add.ChangedAt
            ))
            .ToListAsync(ct);

    public async Task<string?> InviteLinkForAsync(int personId, CancellationToken ct) =>
        _options.Value.IsConfigured
            ? await _dbContext
                .LinkedWhatsAppGroups.AsNoTracking()
                .Where(link =>
                    link.GroupId == null
                    && RefusedInClubGroup()
                        .Any(add => add.PersonId == personId && add.ChatId == link.ChatId)
                )
                .Select(link => link.InviteLink)
                .SingleOrDefaultAsync(ct)
            : null;

    private IQueryable<WhatsAppGroupAdd> RefusedInClubGroup() =>
        _dbContext
            .WhatsAppGroupAdds.AsNoTracking()
            .Where(add =>
                add.State == WhatsAppGroupAddState.Refused
                && add.Person!.ClubGroupConsent
                && add.Person.ArchivedOn == null
                && _dbContext.LinkedWhatsAppGroups.Any(link =>
                    link.GroupId == null && link.KeepsMembers && link.ChatId == add.ChatId
                )
            );
}
