using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppPostTextTests
{
    private const string Link = "https://app.example.test/announcements/7";
    private const string Head = "📌 `FCC · AUSHANG`\n";
    private const string LinkLine = "↗ " + Link;

    [Fact]
    public void Should_TranslateTheNewsSubset_When_TheBodyIsRichText()
    {
        var post = WhatsAppPostText.Render(
            Draft() with
            {
                Body = WhatsAppPostBody.Rich(
                    "## Treffpunkt\nBitte **pünktlich** sein.\n- Besen\n- Eimer \\*mitbringen\\*\nInfos [hier](https://fcc.example/infos)."
                ),
            }
        );

        Assert.Equal(
            Head
                + "*Saalreinigung*\n\n*Treffpunkt*\nBitte *pünktlich* sein.\n• Besen\n• Eimer ∗mitbringen∗\nInfos hier (https://fcc.example/infos).\n\n"
                + LinkLine,
            post.Text
        );
    }

    private static WhatsAppPostDraft Draft() =>
        new()
        {
            Badge = WhatsAppBadge.Announcement,
            Title = "Saalreinigung",
            Slot = null,
            Body = null,
            MentionablePhones = new Dictionary<int, string>(),
            Schedules = [],
            GroupNames = [],
            TakenOverAddOns = [],
            AuthorName = null,
            Link = Link,
        };
}
