using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BeerTabReminderConfiguration : IEntityTypeConfiguration<BeerTabReminder>
{
    public void Configure(EntityTypeBuilder<BeerTabReminder> builder)
    {
        builder.ToTable("beer_tab_reminder");
        builder.HasKey(reminder => reminder.PersonId);
        builder.Property(reminder => reminder.PersonId).ValueGeneratedNever();

        builder
            .HasOne(reminder => reminder.Person)
            .WithOne()
            .HasForeignKey<BeerTabReminder>(reminder => reminder.PersonId)
            .HasConstraintName("fk_beer_tab_reminder_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
