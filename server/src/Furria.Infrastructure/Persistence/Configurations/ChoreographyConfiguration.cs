using System.Text.Json;
using System.Text.Json.Serialization;
using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ChoreographyConfiguration : IEntityTypeConfiguration<Choreography>
{
    private static readonly JsonSerializerOptions DocumentJson = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
        RespectNullableAnnotations = true,
        RespectRequiredConstructorParameters = true,
    };

    private static readonly ValueComparer<ChoreographyDocument> DocumentComparer = new(
        (left, right) => Serialized(left) == Serialized(right),
        document => Serialized(document).GetHashCode(StringComparison.Ordinal),
        document => Deserialized(Serialized(document))
    );

    public void Configure(EntityTypeBuilder<Choreography> builder)
    {
        builder.ToTable(
            "choreography",
            table =>
            {
                table.HasCheckConstraint("ck_choreography_version", "version >= 1");
                table.HasCheckConstraint(
                    "ck_choreography_copied_from_version",
                    "copied_from_version IS NULL OR appearance_id IS NOT NULL"
                );
                table.HasCheckConstraint(
                    "ck_choreography_document",
                    "jsonb_typeof(document) = 'object' AND jsonb_typeof(document -> 'tracks') = 'array'"
                );
            }
        );
        builder.HasKey(choreography => choreography.Id);

        builder
            .Property(choreography => choreography.Document)
            .HasColumnType("jsonb")
            .HasConversion(document => Serialized(document), json => Deserialized(json))
            .Metadata.SetValueComparer(DocumentComparer);
        builder.Property(choreography => choreography.Version).IsConcurrencyToken();

        builder
            .HasOne(choreography => choreography.Act)
            .WithMany()
            .HasForeignKey(choreography => choreography.ActId)
            .HasConstraintName("fk_choreography_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(choreography => choreography.ActId)
            .HasDatabaseName("ix_choreography_act_id");
        builder
            .HasIndex(choreography => choreography.ActId)
            .HasDatabaseName("ix_choreography_act_id_session")
            .HasFilter("appearance_id IS NULL")
            .IsUnique();

        builder
            .HasOne(choreography => choreography.Appearance)
            .WithMany()
            .HasForeignKey(choreography => choreography.AppearanceId)
            .HasConstraintName("fk_choreography_appearance_appearance_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(choreography => choreography.AppearanceId)
            .HasDatabaseName("ix_choreography_appearance_id")
            .IsUnique();

        builder.Property(choreography => choreography.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(choreography => choreography.UpdatedAt).HasDefaultValueSql("now()");
    }

    private static string Serialized(ChoreographyDocument? document) =>
        JsonSerializer.Serialize(document ?? ChoreographyDocument.Empty, DocumentJson);

    private static ChoreographyDocument Deserialized(string json) =>
        JsonSerializer.Deserialize<ChoreographyDocument>(json, DocumentJson)
        ?? ChoreographyDocument.Empty;
}
