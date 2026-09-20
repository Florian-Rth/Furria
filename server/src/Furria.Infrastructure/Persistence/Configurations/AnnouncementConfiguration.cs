using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
{
    private const int TitleLength = 120;
    private const int BodyLength = 4_000;

    public void Configure(EntityTypeBuilder<Announcement> builder)
    {
        builder.ToTable("announcement");
        builder.HasKey(announcement => announcement.Id);

        builder.Property(announcement => announcement.Title).HasMaxLength(TitleLength).IsRequired();

        builder.Property(announcement => announcement.Body).HasMaxLength(BodyLength).IsRequired();

        builder
            .HasOne(announcement => announcement.Author)
            .WithMany()
            .HasForeignKey(announcement => announcement.AuthorPersonId)
            .HasConstraintName("fk_announcement_person_author_person_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(announcement => announcement.PublishedAt);
        builder.HasIndex(announcement => announcement.AuthorPersonId);

        builder.Property(announcement => announcement.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(announcement => announcement.UpdatedAt).HasDefaultValueSql("now()");
    }
}
