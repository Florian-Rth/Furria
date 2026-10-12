using Furria.Infrastructure.Media;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MediaFileTombstoneConfiguration : IEntityTypeConfiguration<MediaFileTombstone>
{
    public void Configure(EntityTypeBuilder<MediaFileTombstone> builder)
    {
        builder.ToTable("media_file_tombstone");
        builder.HasKey(tombstone => tombstone.StorageKey);
        builder.Property(tombstone => tombstone.StorageKey).ValueGeneratedNever();
        builder.Property(tombstone => tombstone.BuriedAt).HasDefaultValueSql("now()");
        builder.HasIndex(tombstone => tombstone.BuriedAt);
    }
}
