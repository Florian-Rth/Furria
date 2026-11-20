using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class LinkedWhatsAppGroupConfiguration : IEntityTypeConfiguration<LinkedWhatsAppGroup>
{
    public void Configure(EntityTypeBuilder<LinkedWhatsAppGroup> builder)
    {
        builder.ToTable("linked_whatsapp_group");
        builder.HasKey(link => link.Id);

        builder
            .Property(link => link.ChatId)
            .HasMaxLength(LinkedWhatsAppGroup.ChatIdLength)
            .IsRequired();

        builder.HasIndex(link => link.ChatId).IsUnique();
        builder
            .HasIndex(link => link.GroupId)
            .HasDatabaseName("ix_linked_whatsapp_group_audience")
            .IsUnique()
            .AreNullsDistinct(false);

        builder
            .HasOne(link => link.Group)
            .WithMany()
            .HasForeignKey(link => link.GroupId)
            .HasConstraintName("fk_linked_whatsapp_group_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
