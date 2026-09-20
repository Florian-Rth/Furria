using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BoardSeatConfiguration : IEntityTypeConfiguration<BoardSeat>
{
    public void Configure(EntityTypeBuilder<BoardSeat> builder)
    {
        builder.ToTable(
            "board_seat",
            table =>
                table.HasCheckConstraint(
                    "ck_board_seat_period",
                    "until_on IS NULL OR until_on >= since_on"
                )
        );
        builder.HasKey(seat => seat.Id);

        builder
            .HasOne(seat => seat.BoardOffice)
            .WithMany()
            .HasForeignKey(seat => seat.BoardOfficeId)
            .HasConstraintName("fk_board_seat_board_office_board_office_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(seat => seat.Person)
            .WithMany()
            .HasForeignKey(seat => seat.PersonId)
            .HasConstraintName("fk_board_seat_person_person_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(seat => seat.PersonId);
        builder.HasIndex(seat => seat.BoardOfficeId);

        builder.Property(seat => seat.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(seat => seat.UpdatedAt).HasDefaultValueSql("now()");
    }
}
