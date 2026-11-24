using Furria.Core.Assistant;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ClubAssistantModelCallConfiguration
    : IEntityTypeConfiguration<ClubAssistantModelCall>
{
    public void Configure(EntityTypeBuilder<ClubAssistantModelCall> builder)
    {
        builder.ToTable(
            "club_assistant_model_call",
            table =>
                table.HasCheckConstraint(
                    "ck_club_assistant_model_call_counts",
                    "input_tokens >= 0 AND cached_input_tokens >= 0 AND output_tokens >= 0 AND cost_euros >= 0"
                )
        );
        builder.HasKey(call => call.Id);
        builder
            .Property(call => call.CostEuros)
            .HasPrecision(ClubAssistantModelCall.CostPrecision, ClubAssistantModelCall.CostScale);
        builder.HasIndex(call => call.CalledAt);
    }
}
