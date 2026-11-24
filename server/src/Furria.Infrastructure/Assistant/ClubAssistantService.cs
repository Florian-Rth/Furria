using System.Diagnostics.Contracts;
using Furria.Application.Assistant;
using Furria.Application.Results;
using Furria.Core.Assistant;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Assistant;

public sealed class ClubAssistantService
{
    private const string NoModelAccessMessage =
        "Für den Vereinsassistenten fehlt noch der Zugang zum KI-Anbieter.";

    private readonly AppDbContext _dbContext;
    private readonly ClubAssistantBudget _budget;
    private readonly IOptions<ClubAssistantOptions> _options;

    public ClubAssistantService(
        AppDbContext dbContext,
        ClubAssistantBudget budget,
        IOptions<ClubAssistantOptions> options
    )
    {
        _dbContext = dbContext;
        _budget = budget;
        _options = options;
    }

    public async Task<ClubAssistantDetails> GetAsync(CancellationToken ct)
    {
        var settings =
            await _dbContext
                .ClubAssistantSettingsRows.AsNoTracking()
                .SingleOrDefaultAsync(row => row.Id == ClubAssistantSettings.TheOnlyId, ct)
            ?? new ClubAssistantSettings();

        return new ClubAssistantDetails(
            settings.IsEnabled,
            settings.MonthlyBudgetEuros,
            settings.QuestionsPerPersonPerDay,
            await _budget.UsedThisMonthAsync(ct),
            _options.Value.IsConfigured
        );
    }

    public async Task<Result> UpdateAsync(UpdateClubAssistantCommand command, CancellationToken ct)
    {
        var settings = await TrackedSettingsAsync(ct);
        if (IsSwitchedOn(settings, command) && !_options.Value.IsConfigured)
            return Result.Conflict(NoModelAccessMessage);

        settings.IsEnabled = command.IsEnabled;
        settings.MonthlyBudgetEuros = command.MonthlyBudgetEuros;
        settings.QuestionsPerPersonPerDay = command.QuestionsPerPersonPerDay;

        return await _dbContext.SaveOrConflictAsync(ct);
    }

    [Pure]
    private static bool IsSwitchedOn(
        ClubAssistantSettings settings,
        UpdateClubAssistantCommand command
    ) => command.IsEnabled && !settings.IsEnabled;

    private async Task<ClubAssistantSettings> TrackedSettingsAsync(CancellationToken ct)
    {
        var existing = await _dbContext.ClubAssistantSettingsRows.SingleOrDefaultAsync(
            row => row.Id == ClubAssistantSettings.TheOnlyId,
            ct
        );
        if (existing is not null)
            return existing;

        var created = new ClubAssistantSettings();
        _dbContext.ClubAssistantSettingsRows.Add(created);

        return created;
    }
}
