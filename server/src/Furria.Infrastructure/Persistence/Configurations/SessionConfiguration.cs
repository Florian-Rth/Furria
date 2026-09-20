using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    private const int MottoLength = 160;
    private const int LogoSvgLength = 200_000;

    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.ToTable(
            "session",
            table => table.HasCheckConstraint("ck_session_number", "number IS NULL OR number > 0")
        );
        builder.HasKey(session => session.Id);

        builder.Property(session => session.Motto).HasMaxLength(MottoLength);
        builder.Property(session => session.LogoSvg).HasMaxLength(LogoSvgLength);

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
