using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class FrozenCastMemberConfiguration : IEntityTypeConfiguration<FrozenCastMember>
{
    public void Configure(EntityTypeBuilder<FrozenCastMember> builder)
    {
        builder.ToTable("act_frozen_cast_member");
        builder.HasKey(member => new { member.ActId, member.PersonId });

        builder
            .HasOne(member => member.Act)
            .WithMany(act => act.FrozenCast)
            .HasForeignKey(member => member.ActId)
            .HasConstraintName("fk_act_frozen_cast_member_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(member => member.Person)
            .WithMany()
            .HasForeignKey(member => member.PersonId)
            .HasConstraintName("fk_act_frozen_cast_member_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(member => member.PersonId)
            .HasDatabaseName("ix_act_frozen_cast_member_person_id");
    }
}
