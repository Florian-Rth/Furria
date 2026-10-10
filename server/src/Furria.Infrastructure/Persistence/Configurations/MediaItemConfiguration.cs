using Furria.Core.Media;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MediaItemConfiguration : IEntityTypeConfiguration<MediaItem>
{
    private const int EnumLength = 32;

    private static readonly string KnownOwnerKinds = NamesOf<MediaOwnerKind>();
    private static readonly string KnownKinds = NamesOf<MediaKind>();
    private static readonly string KnownStates = NamesOf<MediaItemState>();

    public void Configure(EntityTypeBuilder<MediaItem> builder)
    {
        builder.ToTable(
            "media_item",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_media_item_owner_kind",
                    $"owner_kind IN ({KnownOwnerKinds})"
                );
                table.HasCheckConstraint("ck_media_item_kind", $"kind IN ({KnownKinds})");
                table.HasCheckConstraint("ck_media_item_state", $"state IN ({KnownStates})");
                table.HasCheckConstraint(
                    "ck_media_item_owner",
                    $"""
                    (owner_kind = '{MediaOwnerKind.Person}' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL)
                    OR (owner_kind = '{MediaOwnerKind.Group}' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL)
                    OR (owner_kind = '{MediaOwnerKind.NewsPost}' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL)
                    OR (owner_kind = '{MediaOwnerKind.Gallery}' AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL)
                    """
                );
                table.HasCheckConstraint("ck_media_item_byte_size", "byte_size > 0");
                table.HasCheckConstraint(
                    "ck_media_item_album_owner",
                    $"album_id IS NULL OR owner_kind = '{MediaOwnerKind.Gallery}'"
                );
                table.HasCheckConstraint(
                    "ck_media_item_placed",
                    "(album_id IS NULL) = (placed_at IS NULL)"
                );
                table.HasCheckConstraint(
                    "ck_media_item_binned",
                    "binned_at IS NULL OR album_id IS NOT NULL"
                );
                table.HasCheckConstraint(
                    "ck_media_item_selection",
                    $"""
                    selection_position IS NULL
                    OR (selection_position > 0 AND album_id IS NOT NULL AND binned_at IS NULL AND kind = '{MediaKind.Photo}')
                    """
                );
                table.HasCheckConstraint(
                    "ck_media_item_caption",
                    "caption IS NULL OR selection_position IS NOT NULL"
                );
            }
        );
        builder.HasKey(item => item.Id);

        builder.Property(item => item.OwnerKind).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(item => item.Kind).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(item => item.State).HasConversion<string>().HasMaxLength(EnumLength);
        builder
            .Property(item => item.OriginalFileName)
            .HasMaxLength(MediaItem.OriginalFileNameLength)
            .IsRequired();
        builder
            .Property(item => item.ContentType)
            .HasMaxLength(MediaItem.ContentTypeLength)
            .IsRequired();
        builder.Property(item => item.Camera).HasMaxLength(MediaItem.CameraLength);
        builder.Property(item => item.FailureReason).HasMaxLength(MediaItem.FailureReasonLength);
        builder.OwnsOne(item => item.Crop);

        builder
            .HasOne(item => item.OwnerPerson)
            .WithMany()
            .HasForeignKey(item => item.OwnerPersonId)
            .HasConstraintName("fk_media_item_person_owner_person_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasOne(item => item.OwnerGroup)
            .WithMany()
            .HasForeignKey(item => item.OwnerGroupId)
            .HasConstraintName("fk_media_item_group_owner_group_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasOne(item => item.OwnerNewsPost)
            .WithMany()
            .HasForeignKey(item => item.OwnerNewsPostId)
            .HasConstraintName("fk_media_item_news_post_owner_news_post_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasOne(item => item.UploadedBy)
            .WithMany()
            .HasForeignKey(item => item.UploadedByPersonId)
            .HasConstraintName("fk_media_item_person_uploaded_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(item => item.Caption).HasMaxLength(MediaItem.CaptionLength);
        builder
            .HasOne(item => item.Album)
            .WithMany(album => album.Items)
            .HasForeignKey(item => item.AlbumId)
            .HasConstraintName("fk_media_item_album_album_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(item => item.StorageKey).IsUnique();
        builder.HasIndex(item => item.AlbumId);
        builder.HasIndex(item => item.PlacedAt);
        builder.HasIndex(item => item.OwnerPersonId);
        builder.HasIndex(item => item.OwnerGroupId);
        builder.HasIndex(item => item.OwnerNewsPostId);
        builder.HasIndex(item => item.UploadedByPersonId);

        builder.Property(item => item.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(item => item.UpdatedAt).HasDefaultValueSql("now()");
    }

    private static string NamesOf<TEnum>()
        where TEnum : struct, Enum =>
        string.Join(", ", Enum.GetNames<TEnum>().Select(name => $"'{name}'"));
}
