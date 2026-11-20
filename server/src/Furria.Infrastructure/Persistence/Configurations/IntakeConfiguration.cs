using Furria.Core.Intakes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class IntakeConfiguration : IEntityTypeConfiguration<Intake>
{
    private const string NoDetailsHeld =
        "first_name IS NULL AND last_name IS NULL AND birth_date IS NULL AND street IS NULL "
        + "AND zip IS NULL AND city IS NULL AND phone IS NULL AND email IS NULL "
        + "AND NOT contact_visible_to_members";
    private const string AwaitingReview =
        "submitted_at IS NOT NULL AND completed_at IS NULL AND discarded_at IS NULL";

    public void Configure(EntityTypeBuilder<Intake> builder)
    {
        builder.ToTable(
            "intake",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_intake_label",
                    "label IS NULL OR length(btrim(label)) > 0"
                );
                table.HasCheckConstraint("ck_intake_expiry", "expires_at > created_at");
                table.HasCheckConstraint(
                    "ck_intake_one_ending",
                    "completed_at IS NULL OR discarded_at IS NULL"
                );
                table.HasCheckConstraint(
                    "ck_intake_completed_after_submission",
                    "completed_at IS NULL OR submitted_at IS NOT NULL"
                );
                table.HasCheckConstraint(
                    "ck_intake_person_once_completed",
                    "person_id IS NULL OR completed_at IS NOT NULL"
                );
                table.HasCheckConstraint(
                    "ck_intake_seed_only_while_undecided",
                    "token_seed IS NULL OR (completed_at IS NULL AND discarded_at IS NULL)"
                );
                table.HasCheckConstraint(
                    "ck_intake_details_only_while_awaiting_review",
                    $"({NoDetailsHeld}) OR ({AwaitingReview})"
                );
            }
        );
        builder.HasKey(intake => intake.Id);

        builder.Property(intake => intake.Label).HasMaxLength(Intake.LabelLength);
        builder.Property(intake => intake.TokenSeed).HasMaxLength(Intake.SeedLength);
        builder
            .Property(intake => intake.TokenHash)
            .HasMaxLength(Intake.TokenHashLength)
            .IsRequired();
        builder.Property(intake => intake.FirstName).HasMaxLength(Intake.NameLength);
        builder.Property(intake => intake.LastName).HasMaxLength(Intake.NameLength);
        builder.Property(intake => intake.Street).HasMaxLength(Intake.StreetLength);
        builder.Property(intake => intake.Zip).HasMaxLength(Intake.ZipLength);
        builder.Property(intake => intake.City).HasMaxLength(Intake.CityLength);
        builder.Property(intake => intake.Phone).HasMaxLength(Intake.PhoneLength);
        builder.Property(intake => intake.Email).HasMaxLength(Intake.EmailLength);
        builder.Property(intake => intake.Version).IsConcurrencyToken();

        builder
            .HasOne(intake => intake.StartedBy)
            .WithMany()
            .HasForeignKey(intake => intake.StartedByPersonId)
            .HasConstraintName("fk_intake_person_started_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(intake => intake.Person)
            .WithMany()
            .HasForeignKey(intake => intake.PersonId)
            .HasConstraintName("fk_intake_person_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(intake => intake.TokenHash).IsUnique();
        builder.HasIndex(intake => intake.StartedByPersonId);
        builder.HasIndex(intake => intake.PersonId);
        builder.HasIndex(intake => intake.CreatedAt);

        builder.Property(intake => intake.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(intake => intake.UpdatedAt).HasDefaultValueSql("now()");
    }
}
