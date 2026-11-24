using Furria.Core.Assistant;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ClubAssistantNoticeConfiguration : IEntityTypeConfiguration<ClubAssistantNotice>
{
    private const int KindLength = 32;

    private static readonly string KnownKinds = string.Join(
        ", ",
        Enum.GetNames<ClubAssistantNoticeKind>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<ClubAssistantNotice> builder)
    {
        builder.ToTable(
            "club_assistant_notice",
            table =>
                table.HasCheckConstraint("ck_club_assistant_notice_kind", $"kind IN ({KnownKinds})")
        );
        builder.HasKey(notice => new { notice.ChatId, notice.Kind });
        builder.Property(notice => notice.ChatId).HasMaxLength(ClubAssistantQuestion.ChatIdLength);
        builder.Property(notice => notice.Kind).HasConversion<string>().HasMaxLength(KindLength);
    }
}
