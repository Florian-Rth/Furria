using Furria.Application.Assistant;
using Furria.Core.Assistant;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantBudget
{
    private readonly AppDbContext _dbContext;
    private readonly IOptions<ClubAssistantOptions> _options;
    private readonly TimeProvider _timeProvider;

    public ClubAssistantBudget(
        AppDbContext dbContext,
        IOptions<ClubAssistantOptions> options,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _options = options;
        _timeProvider = timeProvider;
    }

    public async Task<bool> HasBudgetLeftAsync(CancellationToken ct)
    {
        var monthlyBudget = await _dbContext
            .ClubAssistantSettingsRows.AsNoTracking()
            .Where(row => row.Id == ClubAssistantSettings.TheOnlyId)
            .Select(row => (decimal?)row.MonthlyBudgetEuros)
            .SingleOrDefaultAsync(ct);

        return await UsedThisMonthAsync(ct)
            < (monthlyBudget ?? ClubAssistantSettings.DefaultMonthlyBudgetEuros);
    }

    public async Task<decimal> UsedThisMonthAsync(CancellationToken ct)
    {
        var monthStart = ClubAssistantMonth.StartOf(ClubClock.Today(_timeProvider));

        return await _dbContext
            .ClubAssistantModelCalls.Where(call => call.CalledAt >= monthStart)
            .SumAsync(call => call.CostEuros, ct);
    }

    public async Task BookAsync(ClubAssistantTokens reported, CancellationToken ct)
    {
        var tokens = reported.WithoutNegatives();
        _dbContext.ClubAssistantModelCalls.Add(
            new ClubAssistantModelCall
            {
                CalledAt = _timeProvider.GetUtcNow(),
                InputTokens = tokens.Input,
                CachedInputTokens = tokens.CachedInput,
                OutputTokens = tokens.Output,
                CostEuros = tokens.CostIn(_options.Value.Prices),
            }
        );
        await _dbContext.SaveChangesAsync(ct);
    }
}
