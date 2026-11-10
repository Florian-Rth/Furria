using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Promo;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Promo;

public sealed class PromoService
{
    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public PromoService(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<PromoMemberSummary>> GetMembersAsync(CancellationToken ct)
    {
        var today = ClubClock.Today(_timeProvider);

        var rows = await _dbContext
            .PeopleWithAccessOn(today)
            .AsNoTracking()
            .Join(
                _dbContext.Users,
                person => (int?)person.Id,
                account => account.PersonId,
                (person, account) =>
                    new MemberRow
                    {
                        AccountId = account.Id,
                        FirstName = person.FirstName,
                        LastName = person.LastName,
                        ArrivedAt = _dbContext
                            .AccountEvents.Where(accountEvent =>
                                accountEvent.PersonId == person.Id
                                && accountEvent.Kind == AccountEventKind.Redeemed
                            )
                            .Max(accountEvent => (DateTimeOffset?)accountEvent.At),
                    }
            )
            .OrderBy(row => row.ArrivedAt != null)
            .ThenBy(row => row.ArrivedAt)
            .ThenBy(row => row.AccountId)
            .ToListAsync(ct);

        return [.. rows.Select(ToSummary)];
    }

    [Pure]
    private static PromoMemberSummary ToSummary(MemberRow row) =>
        new()
        {
            AccountId = row.AccountId,
            FirstName = row.FirstName,
            LastInitial = InitialOf(row.LastName),
            ArrivedAt = row.ArrivedAt,
        };

    [Pure]
    private static string InitialOf(string name)
    {
        var trimmed = name.Trim();

        return trimmed.Length == 0 ? "" : StringInfo.GetNextTextElement(trimmed).ToUpperInvariant();
    }

    private sealed record MemberRow
    {
        public required int AccountId { get; init; }

        public required string FirstName { get; init; }

        public required string LastName { get; init; }

        public required DateTimeOffset? ArrivedAt { get; init; }
    }
}
