using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActCoEditorConfiguration : IEntityTypeConfiguration<ActCoEditor>
{
    public void Configure(EntityTypeBuilder<ActCoEditor> builder)
    {
        builder.ToTable("act_co_editor");
        builder.HasKey(coEditor => new { coEditor.ActId, coEditor.PersonId });
        builder.Property(coEditor => coEditor.GrantedAt).HasDefaultValueSql("now()");

        builder
            .HasOne(coEditor => coEditor.Act)
            .WithMany()
            .HasForeignKey(coEditor => coEditor.ActId)
            .HasConstraintName("fk_act_co_editor_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(coEditor => coEditor.Person)
            .WithMany()
            .HasForeignKey(coEditor => coEditor.PersonId)
            .HasConstraintName("fk_act_co_editor_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(coEditor => coEditor.PersonId)
            .HasDatabaseName("ix_act_co_editor_person_id");

        builder
            .HasOne(coEditor => coEditor.GrantedBy)
            .WithMany()
            .HasForeignKey(coEditor => coEditor.GrantedByPersonId)
            .HasConstraintName("fk_act_co_editor_person_granted_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasIndex(coEditor => coEditor.GrantedByPersonId)
            .HasDatabaseName("ix_act_co_editor_granted_by_person_id");
    }
}
