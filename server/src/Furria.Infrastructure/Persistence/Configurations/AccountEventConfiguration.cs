using Furria.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AccountEventConfiguration : IEntityTypeConfiguration<AccountEvent>
{
    public void Configure(EntityTypeBuilder<AccountEvent> builder)
    {
        builder.ToTable("account_event");
        builder.HasKey(accountEvent => accountEvent.Id);

        builder
            .Property(accountEvent => accountEvent.Kind)
            .HasConversion<string>()
            .HasMaxLength(32);

        builder.HasIndex(accountEvent => new { accountEvent.PersonId, accountEvent.At });
        builder.HasIndex(accountEvent => accountEvent.ActorPersonId);

        builder
            .HasOne(accountEvent => accountEvent.Person)
            .WithMany()
            .HasForeignKey(accountEvent => accountEvent.PersonId)
            .HasConstraintName("fk_account_event_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(accountEvent => accountEvent.Actor)
            .WithMany()
            .HasForeignKey(accountEvent => accountEvent.ActorPersonId)
            .HasConstraintName("fk_account_event_person_actor_person_id")
            .OnDelete(DeleteBehavior.SetNull);
    }
}
