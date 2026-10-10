using Furria.Core.News;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class NewsPostMentionConfiguration : IEntityTypeConfiguration<NewsPostMention>
{
    public void Configure(EntityTypeBuilder<NewsPostMention> builder)
    {
        builder.ToTable(
            "news_post_mention",
            table =>
                table.HasCheckConstraint(
                    "ck_news_post_mention_one_target",
                    "(group_id IS NULL) <> (person_id IS NULL)"
                )
        );
        builder.HasKey(mention => mention.Id);

        builder
            .HasOne(mention => mention.NewsPost)
            .WithMany(post => post.Mentions)
            .HasForeignKey(mention => mention.NewsPostId)
            .HasConstraintName("fk_news_post_mention_news_post_news_post_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasOne(mention => mention.Group)
            .WithMany()
            .HasForeignKey(mention => mention.GroupId)
            .HasConstraintName("fk_news_post_mention_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasOne(mention => mention.Person)
            .WithMany()
            .HasForeignKey(mention => mention.PersonId)
            .HasConstraintName("fk_news_post_mention_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(mention => new { mention.NewsPostId, mention.GroupId })
            .IsUnique()
            .HasFilter("group_id IS NOT NULL");
        builder
            .HasIndex(mention => new { mention.NewsPostId, mention.PersonId })
            .IsUnique()
            .HasFilter("person_id IS NOT NULL");
        builder.HasIndex(mention => mention.GroupId);
        builder.HasIndex(mention => mention.PersonId);
    }
}
