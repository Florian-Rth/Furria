using System.Globalization;
using Furria.Core.Website;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class WebsitePictureConfiguration : IEntityTypeConfiguration<WebsitePicture>
{
    public void Configure(EntityTypeBuilder<WebsitePicture> builder)
    {
        builder.ToTable(
            "website_picture",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_website_picture_slot_key",
                    $"slot_key ~ '{PictureSlotPosition.SlotKeyPattern}'"
                );
                table.HasCheckConstraint(
                    "ck_website_picture_position",
                    $"position BETWEEN {PictureSlotPosition.FirstPosition} AND {PictureSlotPosition.LastPosition}"
                );
                table.HasCheckConstraint(
                    "ck_website_picture_aspect",
                    string.Create(
                        CultureInfo.InvariantCulture,
                        $"aspect BETWEEN {WebsitePicture.NarrowestAspect} AND {WebsitePicture.WidestAspect}"
                    )
                );
            }
        );
        builder.HasKey(picture => new { picture.SlotKey, picture.Position });

        builder
            .Property(picture => picture.SlotKey)
            .HasMaxLength(PictureSlotPosition.SlotKeyLength)
            .IsRequired();
        builder.Property(picture => picture.Alt).HasMaxLength(WebsitePicture.AltLength);

        builder
            .HasOne(picture => picture.MediaItem)
            .WithOne(item => item.WebsitePicture)
            .HasForeignKey<WebsitePicture>(picture => picture.MediaItemId)
            .HasConstraintName("fk_website_picture_media_item_media_item_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasOne(picture => picture.UpdatedBy)
            .WithMany()
            .HasForeignKey(picture => picture.UpdatedByPersonId)
            .HasConstraintName("fk_website_picture_person_updated_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(picture => picture.MediaItemId).IsUnique();
        builder.HasIndex(picture => picture.UpdatedByPersonId);
    }
}
