using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarPollVoteConfiguration : IEntityTypeConfiguration<CalendarPollVote>
{
    public void Configure(EntityTypeBuilder<CalendarPollVote> builder)
    {
        builder.ToTable("calendar_poll_vote");
        builder.HasKey(vote => vote.Id);

        builder
            .HasOne(vote => vote.PollOption)
            .WithMany(option => option.Votes)
            .HasForeignKey(vote => new { vote.PollId, vote.PollOptionId })
            .HasPrincipalKey(option => new { option.PollId, option.Id })
            .HasConstraintName("fk_calendar_poll_vote_calendar_poll_option_poll_id_poll_option_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(vote => vote.Person)
            .WithMany()
            .HasForeignKey(vote => vote.PersonId)
            .HasConstraintName("fk_calendar_poll_vote_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(vote => new
            {
                vote.PollId,
                vote.PollOptionId,
                vote.PersonId,
            })
            .HasDatabaseName("ix_calendar_poll_vote_poll_id_poll_option_id_person_id")
            .IsUnique();
        builder
            .HasIndex(vote => new { vote.PollId, vote.PersonId })
            .HasDatabaseName("ix_calendar_poll_vote_poll_id_person_id");
        builder.HasIndex(vote => vote.PersonId).HasDatabaseName("ix_calendar_poll_vote_person_id");

        builder.Property(vote => vote.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(vote => vote.UpdatedAt).HasDefaultValueSql("now()");
    }
}
