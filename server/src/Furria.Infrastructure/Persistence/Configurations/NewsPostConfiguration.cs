using Furria.Core.News;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class NewsPostConfiguration : IEntityTypeConfiguration<NewsPost>
{
    private const int EnumLength = 32;
    private const int SlugLength = NewsSlug.MaxLength + 12;

    private static readonly string KnownCategories = string.Join(
        ", ",
        Enum.GetNames<NewsCategory>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<NewsPost> builder)
    {
        builder.ToTable(
            "news_post",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_news_post_category",
                    $"category IS NULL OR category IN ({KnownCategories})"
                );
                table.HasCheckConstraint(
                    "ck_news_post_pending_category",
                    $"pending_category IS NULL OR pending_category IN ({KnownCategories})"
                );
                table.HasCheckConstraint(
                    "ck_news_post_published",
                    "(published_at IS NULL) = (slug IS NULL)"
                );
                table.HasCheckConstraint(
                    "ck_news_post_withdrawn",
                    "withdrawn_at IS NULL OR published_at IS NOT NULL"
                );
                table.HasCheckConstraint(
                    "ck_news_post_pending",
                    "pending_saved_at IS NULL OR (published_at IS NOT NULL AND withdrawn_at IS NULL)"
                );
                table.HasCheckConstraint(
                    "ck_news_post_pending_picture",
                    "pending_saved_at IS NOT NULL OR (pending_picture_id IS NULL AND pending_picture_caption IS NULL)"
                );
            }
        );
        builder.HasKey(post => post.Id);

        builder.Property(post => post.Title).HasMaxLength(NewsPost.TitleLength).IsRequired();
        builder.Property(post => post.Teaser).HasMaxLength(NewsPost.TeaserLength).IsRequired();
        builder.Property(post => post.Text).HasMaxLength(NewsPost.TextLength).IsRequired();
        builder.Property(post => post.Category).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(post => post.PendingTitle).HasMaxLength(NewsPost.TitleLength).IsRequired();
        builder
            .Property(post => post.PendingTeaser)
            .HasMaxLength(NewsPost.TeaserLength)
            .IsRequired();
        builder.Property(post => post.PendingText).HasMaxLength(NewsPost.TextLength).IsRequired();
        builder
            .Property(post => post.PendingCategory)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);
        builder.Property(post => post.Slug).HasMaxLength(SlugLength);
        builder.Property(post => post.PictureCaption).HasMaxLength(NewsPost.PictureCaptionLength);
        builder
            .Property(post => post.PendingPictureCaption)
            .HasMaxLength(NewsPost.PictureCaptionLength);

        builder
            .HasOne(post => post.Author)
            .WithMany()
            .HasForeignKey(post => post.AuthorPersonId)
            .HasConstraintName("fk_news_post_person_author_person_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasOne(post => post.LastSavedBy)
            .WithMany()
            .HasForeignKey(post => post.LastSavedByPersonId)
            .HasConstraintName("fk_news_post_person_last_saved_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasOne(post => post.Event)
            .WithMany()
            .HasForeignKey(post => post.EventId)
            .HasConstraintName("fk_news_post_event_event_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasOne(post => post.Album)
            .WithMany()
            .HasForeignKey(post => post.AlbumId)
            .HasConstraintName("fk_news_post_album_album_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasOne(post => post.PendingEvent)
            .WithMany()
            .HasForeignKey(post => post.PendingEventId)
            .HasConstraintName("fk_news_post_event_pending_event_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasOne(post => post.PendingAlbum)
            .WithMany()
            .HasForeignKey(post => post.PendingAlbumId)
            .HasConstraintName("fk_news_post_album_pending_album_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasOne(post => post.Picture)
            .WithMany()
            .HasForeignKey(post => post.PictureId)
            .HasConstraintName("fk_news_post_media_item_picture_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasOne(post => post.PendingPicture)
            .WithMany()
            .HasForeignKey(post => post.PendingPictureId)
            .HasConstraintName("fk_news_post_media_item_pending_picture_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(post => post.Slug).IsUnique();
        builder.HasIndex(post => post.PublishedAt);
        builder.HasIndex(post => post.AuthorPersonId);
        builder.HasIndex(post => post.LastSavedByPersonId);
        builder.HasIndex(post => post.EventId);
        builder.HasIndex(post => post.AlbumId);
        builder.HasIndex(post => post.PendingEventId);
        builder.HasIndex(post => post.PendingAlbumId);
        builder.HasIndex(post => post.PictureId).IsUnique();
        builder.HasIndex(post => post.PendingPictureId).IsUnique();

        builder.Property(post => post.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(post => post.UpdatedAt).HasDefaultValueSql("now()");
    }
}
