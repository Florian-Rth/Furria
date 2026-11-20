using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class WhatsAppSessionConfiguration : IEntityTypeConfiguration<WhatsAppSession>
{
    private const int EnumLength = 32;

    private static readonly string KnownStatuses = string.Join(
        ", ",
        Enum.GetNames<WhatsAppSessionStatus>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<WhatsAppSession> builder)
    {
        builder.ToTable(
            "whatsapp_session",
            table =>
                table.HasCheckConstraint(
                    "ck_whatsapp_session_status",
                    $"status IN ({KnownStatuses})"
                )
        );
        builder.HasKey(session => session.Name);

        builder.Property(session => session.Name).HasMaxLength(WhatsAppSession.NameLength);
        builder
            .Property(session => session.Status)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);
    }
}
