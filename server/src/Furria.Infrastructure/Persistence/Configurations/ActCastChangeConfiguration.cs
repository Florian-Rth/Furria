using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActCastChangeConfiguration : IEntityTypeConfiguration<ActCastChange>
{
    private const int EnumLength = 32;

    private static readonly string KnownChanges = string.Join(
        ", ",
        Enum.GetNames<CastChange>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<ActCastChange> builder)
    {
        builder.ToTable(
            "act_cast_change",
            table =>
                table.HasCheckConstraint("ck_act_cast_change_change", $"change IN ({KnownChanges})")
        );
        builder.HasKey(change => new { change.ActId, change.PersonId });

        builder.Property(change => change.Change).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(change => change.Act)
            .WithMany(act => act.CastChanges)
            .HasForeignKey(change => change.ActId)
            .HasConstraintName("fk_act_cast_change_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(change => change.Person)
            .WithMany()
            .HasForeignKey(change => change.PersonId)
            .HasConstraintName("fk_act_cast_change_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(change => change.PersonId).HasDatabaseName("ix_act_cast_change_person_id");
    }
}
