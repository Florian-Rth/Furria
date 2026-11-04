using Furria.Application.Push;
using Furria.Infrastructure.Push;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class PushSubscriptionConfiguration : IEntityTypeConfiguration<PushSubscription>
{
    public void Configure(EntityTypeBuilder<PushSubscription> builder)
    {
        builder.ToTable("push_subscription");
        builder.HasKey(subscription => subscription.Id);

        builder
            .Property(subscription => subscription.Endpoint)
            .HasMaxLength(PushEndpoint.MaxLength)
            .IsRequired();
        builder
            .Property(subscription => subscription.PublicKey)
            .HasMaxLength(PushKeys.EncodedPublicKeyLength)
            .IsRequired();
        builder
            .Property(subscription => subscription.AuthSecret)
            .HasMaxLength(PushKeys.EncodedAuthSecretLength)
            .IsRequired();

        builder.HasIndex(subscription => subscription.Endpoint).IsUnique();
        builder.HasIndex(subscription => subscription.AccountId);

        builder
            .HasOne(subscription => subscription.Account)
            .WithMany()
            .HasForeignKey(subscription => subscription.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
