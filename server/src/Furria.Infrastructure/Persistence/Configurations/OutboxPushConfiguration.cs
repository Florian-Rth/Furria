using Furria.Infrastructure.Push;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class OutboxPushConfiguration : IEntityTypeConfiguration<OutboxPush>
{
    public void Configure(EntityTypeBuilder<OutboxPush> builder)
    {
        builder.ToTable(
            "outbox_push",
            table => table.HasCheckConstraint("ck_outbox_push_attempt", "attempt >= 1")
        );
        builder.HasKey(push => push.Id);

        builder.Property(push => push.Title).HasMaxLength(OutboxPush.TitleLength).IsRequired();
        builder.Property(push => push.Body).HasMaxLength(OutboxPush.BodyLength).IsRequired();
        builder.Property(push => push.Url).HasMaxLength(OutboxPush.UrlLength).IsRequired();
        builder.Property(push => push.Tag).HasMaxLength(OutboxPush.TagLength).IsRequired();

        builder
            .HasOne(push => push.Account)
            .WithMany()
            .HasForeignKey(push => push.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(push => push.NextAttemptAt);
    }
}
