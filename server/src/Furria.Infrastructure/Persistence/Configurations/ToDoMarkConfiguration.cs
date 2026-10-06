using Furria.Application.Management;
using Furria.Infrastructure.Management;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ToDoMarkConfiguration : IEntityTypeConfiguration<ToDoMark>
{
    private const int EnumLength = 32;

    private static readonly string KnownKinds = string.Join(
        ", ",
        Enum.GetNames<ToDoKind>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<ToDoMark> builder)
    {
        builder.ToTable(
            "to_do_mark",
            table => table.HasCheckConstraint("ck_to_do_mark_kind", $"kind IN ({KnownKinds})")
        );
        builder.HasKey(mark => mark.Id);

        builder.Property(mark => mark.Kind).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(mark => mark.Account)
            .WithMany()
            .HasForeignKey(mark => mark.AccountId)
            .HasConstraintName("fk_to_do_mark_account_account_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(mark => new { mark.AccountId, mark.Kind })
            .HasDatabaseName("ix_to_do_mark_account_id_kind")
            .IsUnique();
    }
}
