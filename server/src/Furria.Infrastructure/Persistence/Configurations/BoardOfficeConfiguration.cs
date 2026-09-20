using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BoardOfficeConfiguration : IEntityTypeConfiguration<BoardOffice>
{
    private const int NameLength = 80;

    public void Configure(EntityTypeBuilder<BoardOffice> builder)
    {
        builder.ToTable("board_office");
        builder.HasKey(office => office.Id);

        builder
            .HasOne(office => office.ImpliedRole)
            .WithMany()
            .HasForeignKey(office => office.ImpliedRoleId)
            .HasConstraintName("fk_board_office_role_implied_role_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .Property(office => office.Name)
            .HasMaxLength(NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);

        builder.HasIndex(office => office.Name).HasDatabaseName("ix_board_office_name").IsUnique();

        builder.Property(office => office.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(office => office.UpdatedAt).HasDefaultValueSql("now()");
    }
}
