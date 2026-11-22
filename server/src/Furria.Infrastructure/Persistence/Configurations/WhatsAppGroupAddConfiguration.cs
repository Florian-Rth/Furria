using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class WhatsAppGroupAddConfiguration : IEntityTypeConfiguration<WhatsAppGroupAdd>
{
    private const int EnumLength = 32;

    private static readonly string KnownStates = string.Join(
        ", ",
        Enum.GetNames<WhatsAppGroupAddState>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<WhatsAppGroupAdd> builder)
    {
        builder.ToTable(
            "whatsapp_group_add",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_whatsapp_group_add_state",
                    $"state IN ({KnownStates})"
                );
                table.HasCheckConstraint(
                    "ck_whatsapp_group_add_phone_digits",
                    "phone_digits ~ '^[0-9]{8,15}$'"
                );
            }
        );
        builder.HasKey(add => add.Id);

        builder
            .Property(add => add.ChatId)
            .HasMaxLength(LinkedWhatsAppGroup.ChatIdLength)
            .IsRequired();
        builder
            .Property(add => add.PhoneDigits)
            .HasMaxLength(WhatsAppGroupAdd.PhoneDigitsLength)
            .IsRequired();
        builder.Property(add => add.State).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(add => add.Person)
            .WithMany()
            .HasForeignKey(add => add.PersonId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(add => new { add.ChatId, add.PersonId }).IsUnique();
        builder.HasIndex(add => add.PersonId);
    }
}
