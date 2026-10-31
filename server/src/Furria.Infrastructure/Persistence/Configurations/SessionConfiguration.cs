using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    private const int MottoLength = 160;

    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.ToTable(
            "session",
            table => table.HasCheckConstraint("ck_session_number", "number IS NULL OR number > 0")
        );
        builder.HasKey(session => session.Id);

        builder.Property(session => session.Motto).HasMaxLength(MottoLength);

        builder
            .HasOne(session => session.Logo)
            .WithMany()
            .HasForeignKey(session => session.LogoId)
            .HasConstraintName("fk_session_media_item_logo_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(session => session.LogoId).IsUnique();

        builder
            .HasIndex(session => session.StartYear)
            .HasDatabaseName("ix_session_start_year")
            .IsUnique();
        builder
            .HasIndex(session => session.Number)
            .HasDatabaseName("ix_session_number")
            .IsUnique()
            .HasFilter("number IS NOT NULL");

        builder.Property(session => session.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(session => session.UpdatedAt).HasDefaultValueSql("now()");
    }
}
