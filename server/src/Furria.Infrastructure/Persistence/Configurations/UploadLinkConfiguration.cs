using Furria.Core.Gallery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class UploadLinkConfiguration : IEntityTypeConfiguration<UploadLink>
{
    public void Configure(EntityTypeBuilder<UploadLink> builder)
    {
        builder.ToTable(
            "upload_link",
            table =>
            {
                table.HasCheckConstraint("ck_upload_link_title", "length(btrim(title)) > 0");
                table.HasCheckConstraint("ck_upload_link_expiry", "expires_at > created_at");
                table.HasCheckConstraint(
                    "ck_upload_link_counts",
                    "upload_count >= 0 AND uploaded_bytes >= 0"
                );
            }
        );
        builder.HasKey(link => link.Id);

        builder.Property(link => link.Title).HasMaxLength(UploadLink.TitleLength).IsRequired();
        builder.Property(link => link.TokenSeed).HasMaxLength(UploadLink.SeedLength).IsRequired();
        builder
            .Property(link => link.TokenHash)
            .HasMaxLength(UploadLink.TokenHashLength)
            .IsRequired();

        builder
            .HasOne(link => link.CreatedBy)
            .WithMany()
            .HasForeignKey(link => link.CreatedByPersonId)
            .HasConstraintName("fk_upload_link_person_created_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(link => link.TokenHash).IsUnique();
        builder.HasIndex(link => link.CreatedByPersonId);
        builder.HasIndex(link => link.CreatedAt);

        builder.Property(link => link.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(link => link.UpdatedAt).HasDefaultValueSql("now()");
    }
}
