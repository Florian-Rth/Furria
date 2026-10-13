using Furria.Infrastructure.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class LogEntryConfiguration : IEntityTypeConfiguration<LogEntry>
{
    public void Configure(EntityTypeBuilder<LogEntry> builder)
    {
        builder.ToTable("log_entry");
        builder.HasKey(entry => entry.Id);

        builder
            .Property(entry => entry.Source)
            .HasConversion<string>()
            .HasMaxLength(LogEntry.SourceLength);
        builder
            .Property(entry => entry.Instance)
            .HasMaxLength(LogEntry.InstanceLength)
            .IsRequired();
        builder
            .Property(entry => entry.Level)
            .HasConversion<string>()
            .HasMaxLength(LogEntry.LevelLength);
        builder
            .Property(entry => entry.Category)
            .HasMaxLength(LogEntry.CategoryLength)
            .IsRequired();
        builder
            .Property(entry => entry.Template)
            .HasMaxLength(LogEntry.TemplateLength)
            .IsRequired();
        builder.Property(entry => entry.Message).HasMaxLength(LogEntry.MessageLength).IsRequired();
        builder.Property(entry => entry.Exception).HasMaxLength(LogEntry.ExceptionLength);
        builder.Property(entry => entry.TraceId).HasMaxLength(LogEntry.TraceIdLength);

        builder.HasIndex(entry => entry.LoggedAt);
        builder
            .HasIndex(entry => new
            {
                entry.Source,
                entry.Level,
                entry.Id,
            })
            .IsDescending(false, false, true);
    }
}
