using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ClubRecordConfiguration : IEntityTypeConfiguration<ClubRecord>
{
    public void Configure(EntityTypeBuilder<ClubRecord> builder)
    {
        builder.ToTable(
            "club_record",
            table =>
            {
                table.HasCheckConstraint("ck_club_record_single", $"id = {ClubRecord.TheOnlyId}");
                table.HasCheckConstraint(
                    "ck_club_record_founded_year",
                    $"founded_year IS NULL OR founded_year >= {ClubRecord.EarliestFoundedYear}"
                );
                table.HasCheckConstraint(
                    "ck_club_record_age_of_consent",
                    $"age_of_consent BETWEEN {ClubRecord.YoungestAgeOfConsent} AND {ClubRecord.OldestAgeOfConsent}"
                );
            }
        );
        builder.HasKey(record => record.Id);
        builder.Property(record => record.Id).ValueGeneratedNever();

        builder.Property(record => record.Name).HasMaxLength(ClubRecord.NameLength);
        builder.Property(record => record.ShortName).HasMaxLength(ClubRecord.ShortNameLength);
        builder.Property(record => record.Street).HasMaxLength(ClubRecord.StreetLength);
        builder.Property(record => record.Zip).HasMaxLength(ClubRecord.ZipLength);
        builder.Property(record => record.City).HasMaxLength(ClubRecord.CityLength);
        builder.Property(record => record.Email).HasMaxLength(ClubRecord.EmailLength);
        builder.Property(record => record.Phone).HasMaxLength(ClubRecord.PhoneLength);
        builder.Property(record => record.WebsiteUrl).HasMaxLength(ClubRecord.LinkLength);
        builder.Property(record => record.InstagramUrl).HasMaxLength(ClubRecord.LinkLength);
        builder.Property(record => record.FacebookUrl).HasMaxLength(ClubRecord.LinkLength);

        builder.Property(record => record.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(record => record.UpdatedAt).HasDefaultValueSql("now()");
    }
}
