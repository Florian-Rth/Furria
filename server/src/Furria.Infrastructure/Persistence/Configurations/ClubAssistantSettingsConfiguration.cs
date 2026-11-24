using System.Globalization;
using Furria.Core.Assistant;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ClubAssistantSettingsConfiguration
    : IEntityTypeConfiguration<ClubAssistantSettings>
{
    private static readonly string LargestBudget =
        ClubAssistantSettings.LargestMonthlyBudgetEuros.ToString(CultureInfo.InvariantCulture);

    public void Configure(EntityTypeBuilder<ClubAssistantSettings> builder)
    {
        builder.ToTable(
            "club_assistant_settings",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_club_assistant_settings_single",
                    $"id = {ClubAssistantSettings.TheOnlyId}"
                );
                table.HasCheckConstraint(
                    "ck_club_assistant_settings_monthly_budget",
                    $"monthly_budget_euros BETWEEN 0 AND {LargestBudget}"
                );
                table.HasCheckConstraint(
                    "ck_club_assistant_settings_questions_per_person_per_day",
                    $"questions_per_person_per_day BETWEEN 1 AND {ClubAssistantSettings.MostQuestionsPerPersonPerDay}"
                );
            }
        );
        builder.HasKey(settings => settings.Id);
        builder.Property(settings => settings.Id).ValueGeneratedNever();
        builder.Property(settings => settings.IsEnabled).HasDefaultValue(false);
        builder
            .Property(settings => settings.MonthlyBudgetEuros)
            .HasPrecision(ClubAssistantSettings.BudgetPrecision, ClubAssistantSettings.BudgetScale);
    }
}
