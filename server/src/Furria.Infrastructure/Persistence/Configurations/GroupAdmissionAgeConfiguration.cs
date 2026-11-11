using Furria.Core.GroupMatcher;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class GroupAdmissionAgeConfiguration : IEntityTypeConfiguration<GroupAdmissionAge>
{
    private const int EnumLength = 32;

    private static readonly string KnownBands = string.Join(
        ", ",
        Enum.GetNames<AdmissionAgeBand>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<GroupAdmissionAge> builder)
    {
        builder.ToTable(
            "group_admission_age",
            table =>
                table.HasCheckConstraint("ck_group_admission_age_band", $"band IN ({KnownBands})")
        );
        builder.HasKey(admissionAge => new { admissionAge.GroupId, admissionAge.Band });

        builder
            .Property(admissionAge => admissionAge.Band)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);

        builder
            .HasOne(admissionAge => admissionAge.Group)
            .WithMany()
            .HasForeignKey(admissionAge => admissionAge.GroupId)
            .HasConstraintName("fk_group_admission_age_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
