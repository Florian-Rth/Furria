using Furria.Core.Halls;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class TableTypeConfiguration : IEntityTypeConfiguration<TableType>
{
    public const int NameLength = 60;
    private const int EnumLength = 32;

    private static readonly string KnownShapes = string.Join(
        ", ",
        Enum.GetNames<TableShape>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<TableType> builder)
    {
        builder.ToTable(
            "table_type",
            table =>
            {
                table.HasCheckConstraint("ck_table_type_shape", $"shape IN ({KnownShapes})");
                table.HasCheckConstraint("ck_table_type_size", "length_cm > 0 AND width_cm > 0");
            }
        );
        builder.HasKey(type => type.Id);
        builder
            .Property(type => type.Name)
            .HasMaxLength(NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder.Property(type => type.Shape).HasConversion<string>().HasMaxLength(EnumLength);

        builder.Property(type => type.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(type => type.UpdatedAt).HasDefaultValueSql("now()");
    }
}
