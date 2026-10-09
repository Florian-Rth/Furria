using Furria.Core.Gallery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AlbumConfiguration : IEntityTypeConfiguration<Album>
{
    public void Configure(EntityTypeBuilder<Album> builder)
    {
        builder.ToTable(
            "album",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_album_one_link",
                    "calendar_entry_id IS NULL OR session_start_year IS NULL"
                );
                table.HasCheckConstraint("ck_album_title", "length(btrim(title)) > 0");
            }
        );
        builder.HasKey(album => album.Id);

        builder.Property(album => album.Title).HasMaxLength(Album.TitleLength).IsRequired();
        builder.Property(album => album.Description).HasMaxLength(Album.DescriptionLength);

        builder
            .HasOne(album => album.CalendarEntry)
            .WithMany()
            .HasForeignKey(album => album.CalendarEntryId)
            .HasConstraintName("fk_album_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasOne(album => album.CoverMediaItem)
            .WithMany()
            .HasForeignKey(album => album.CoverMediaItemId)
            .HasConstraintName("fk_album_media_item_cover_media_item_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(album => album.CalendarEntryId);
        builder.HasIndex(album => album.CoverMediaItemId);

        builder.Property(album => album.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(album => album.UpdatedAt).HasDefaultValueSql("now()");
    }
}
