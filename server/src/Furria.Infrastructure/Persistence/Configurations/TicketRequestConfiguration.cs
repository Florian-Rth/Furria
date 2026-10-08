using Furria.Core.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class TicketRequestConfiguration : IEntityTypeConfiguration<TicketRequest>
{
    public void Configure(EntityTypeBuilder<TicketRequest> builder)
    {
        builder.ToTable(
            "ticket_request",
            table =>
                table.HasCheckConstraint(
                    "ck_ticket_request_ticket_count",
                    $"ticket_count BETWEEN {TicketRequest.FewestTickets} AND {TicketRequest.MostTickets}"
                )
        );
        builder.HasKey(request => request.Id);

        builder
            .Property(request => request.Name)
            .HasMaxLength(TicketRequest.NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder
            .Property(request => request.Phone)
            .HasMaxLength(TicketRequest.PhoneLength)
            .IsRequired();
        builder
            .Property(request => request.Email)
            .HasMaxLength(TicketRequest.EmailLength)
            .IsRequired();
        builder.Property(request => request.Message).HasMaxLength(TicketRequest.MessageLength);

        builder
            .HasOne(request => request.Event)
            .WithMany()
            .HasForeignKey(request => request.EventId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(request => request.EventId);
    }
}
