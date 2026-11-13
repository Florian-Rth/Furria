using Furria.Infrastructure.Push;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MutedPushTopicConfiguration : IEntityTypeConfiguration<MutedPushTopic>
{
    private const int EnumLength = 32;

    public void Configure(EntityTypeBuilder<MutedPushTopic> builder)
    {
        builder.ToTable("muted_push_topic");
        builder.HasKey(muted => new { muted.AccountId, muted.Topic });
        builder.Property(muted => muted.Topic).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(muted => muted.Account)
            .WithMany()
            .HasForeignKey(muted => muted.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
