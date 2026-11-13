using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AnnouncementMentionConfiguration : IEntityTypeConfiguration<AnnouncementMention>
{
    private const int EnumLength = 32;

    public void Configure(EntityTypeBuilder<AnnouncementMention> builder)
    {
        builder.ToTable(
            "announcement_mention",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_announcement_mention_target_id_positive",
                    "target_id > 0"
                );
                table.HasCheckConstraint(
                    "ck_announcement_mention_kind",
                    "kind IN ('Group', 'Person', 'CalendarEntry', 'Event', 'NewsPost', 'Album')"
                );
            }
        );
        builder.HasKey(mention => mention.Id);

        builder.Property(mention => mention.Kind).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(mention => mention.Announcement)
            .WithMany(announcement => announcement.Mentions)
            .HasForeignKey(mention => mention.AnnouncementId)
            .HasConstraintName("fk_announcement_mention_announcement_announcement_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(mention => new
            {
                mention.AnnouncementId,
                mention.Kind,
                mention.TargetId,
            })
            .IsUnique();
    }
}
