using Furria.Core.Assistant;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ClubAssistantAcquaintanceConfiguration
    : IEntityTypeConfiguration<ClubAssistantAcquaintance>
{
    public void Configure(EntityTypeBuilder<ClubAssistantAcquaintance> builder)
    {
        builder.ToTable("club_assistant_acquaintance");
        builder.HasKey(acquaintance => acquaintance.PersonId);
        builder.Property(acquaintance => acquaintance.PersonId).ValueGeneratedNever();

        builder
            .HasOne(acquaintance => acquaintance.Person)
            .WithMany()
            .HasForeignKey(acquaintance => acquaintance.PersonId)
            .HasConstraintName("fk_club_assistant_acquaintance_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
