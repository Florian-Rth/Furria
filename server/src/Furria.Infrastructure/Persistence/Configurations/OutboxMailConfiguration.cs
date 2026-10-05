using Furria.Infrastructure.Mail;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class OutboxMailConfiguration : IEntityTypeConfiguration<OutboxMail>
{
    public void Configure(EntityTypeBuilder<OutboxMail> builder)
    {
        builder.ToTable(
            "outbox_mail",
            table => table.HasCheckConstraint("ck_outbox_mail_attempt", "attempt >= 1")
        );
        builder.HasKey(mail => mail.Id);

        builder
            .Property(mail => mail.Template)
            .HasConversion<string>()
            .HasMaxLength(OutboxMail.TemplateLength);
        builder
            .Property(mail => mail.RecipientKind)
            .HasConversion<string>()
            .HasMaxLength(OutboxMail.RecipientKindLength);
        builder.Property(mail => mail.To).HasMaxLength(OutboxMail.AddressLength).IsRequired();
        builder.Property(mail => mail.Subject).HasMaxLength(OutboxMail.SubjectLength).IsRequired();
        builder.Property(mail => mail.TextBody).IsRequired();
        builder.Property(mail => mail.HtmlBody).IsRequired();

        builder.HasIndex(mail => mail.NextAttemptAt);
    }
}
