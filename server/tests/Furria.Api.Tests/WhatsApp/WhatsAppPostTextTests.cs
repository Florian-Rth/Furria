using Furria.Infrastructure.WhatsApp;
using Xunit;

namespace Furria.Api.Tests.WhatsApp;

public sealed class WhatsAppPostTextTests
{
    private const string Link = "https://app.example.test/announcements/7";
    private const string Head = "📌 `FCC · AUSHANG`\n";
    private const string LinkLine = "↗ " + Link;

    private static readonly DateTimeOffset SaturdayAfternoon = new(
        2027,
        6,
        12,
        13,
        0,
        0,
        TimeSpan.Zero
    );

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

    [Fact]
    public void Should_KeepTheHeadingOneBoldRun_When_ItCarriesBoldText()
    {
        var post = WhatsAppPostText.Render(
            Draft() with
            {
                Body = WhatsAppPostBody.Rich("## Titel **fett**"),
            }
        );

        Assert.Equal($"{Head}*Saalreinigung*\n\n*Titel fett*\n\n{LinkLine}", post.Text);
    }

    [Fact]
    public void Should_MentionByPhone_When_TheMentionedPersonHasAWhatsAppNumber()
    {
        var post = WhatsAppPostText.Render(
            Draft() with
            {
                Body = WhatsAppPostBody.Rich(
                    "Danke @[Alice Muster](person:3), @[Bea Aushang](person:4) und @[Tanzgarde](group:2)."
                ),
                MentionablePhones = new Dictionary<int, string> { [3] = "4917012345678" },
            }
        );

        Assert.Equal(
            Head
                + "*Saalreinigung*\n\nDanke @4917012345678, Bea Aushang und Tanzgarde.\n\n"
                + LinkLine,
            post.Text
        );
        Assert.Equal(["4917012345678@c.us"], post.MentionedChatIds);
    }

    [Fact]
    public void Should_KeepThePlainTextAsWritten_When_TheBodyIsPlain()
    {
        var post = WhatsAppPostText.Render(
            Draft() with
            {
                Body = WhatsAppPostBody.Plain("Mit **Sternchen** und [Klammern](x)"),
            }
        );

        Assert.Equal(
            Head + "*Saalreinigung*\n\nMit **Sternchen** und [Klammern](x)\n\n" + LinkLine,
            post.Text
        );
    }

    [Theory]
    [InlineData(null, null, "Sa 12.6. · 15:00 Uhr")]
    [InlineData(null, "Vereinsheim", "Sa 12.6. · 15:00 Uhr · Vereinsheim")]
    [InlineData(3, null, "Sa 12.6. · 15:00–18:00 Uhr")]
    [InlineData(11, "Bühnenhaus", "Sa 12.6. 15:00 Uhr – So 13.6. 02:00 Uhr · Bühnenhaus")]
    public void Should_WriteTheDateLine_When_ThePostIsACalendarEntry(
        int? hoursLong,
        string? venue,
        string expectedDateLine
    )
    {
        var post = WhatsAppPostText.Render(
            Draft() with
            {
                Slot = new WhatsAppPostSlot(
                    SaturdayAfternoon,
                    hoursLong is { } hours ? SaturdayAfternoon.AddHours(hours) : null,
                    venue
                ),
            }
        );

        Assert.Equal($"{Head}*Saalreinigung*\n{expectedDateLine}\n\n{LinkLine}", post.Text);
    }

    [Fact]
    public void Should_ListTheDayScheduleAndGroupsAndAuthor_When_TheEntryCarriesThem()
    {
        var post = WhatsAppPostText.Render(
            Draft() with
            {
                Slot = new WhatsAppPostSlot(
                    SaturdayAfternoon,
                    SaturdayAfternoon.AddHours(11),
                    null
                ),
                Body = WhatsAppPostBody.Plain("Alle helfen mit."),
                Schedules =
                [
                    new WhatsAppPostSchedule(
                        "Aufbau",
                        [
                            new WhatsAppPostStep(0, new TimeOnly(15, 0), "Treffen"),
                            new WhatsAppPostStep(1, new TimeOnly(1, 30), "Abbau"),
                        ]
                    ),
                    new WhatsAppPostSchedule(
                        null,
                        [new WhatsAppPostStep(0, new TimeOnly(19, 11), "Einmarsch")]
                    ),
                ],
                GroupNames = ["Tanzgarde", "Elferrat"],
                AuthorName = "Bea Aushang",
            }
        );

        Assert.Equal(
            Head
                + "*Saalreinigung*\nSa 12.6. 15:00 Uhr – So 13.6. 02:00 Uhr\n\nAlle helfen mit.\n\n*Aufbau*\nSa 15:00 Treffen\nSo 01:30 Abbau\n\nSa 19:11 Einmarsch\n\nDabei: Tanzgarde, Elferrat\n\n_Bea Aushang_\n"
                + LinkLine,
            post.Text
        );
    }

    [Fact]
    public void Should_LeaveTheWeekdayOut_When_TheEntryLastsOneDay()
    {
        var post = WhatsAppPostText.Render(
            Draft() with
            {
                Slot = new WhatsAppPostSlot(SaturdayAfternoon, null, null),
                Schedules =
                [
                    new WhatsAppPostSchedule(
                        null,
                        [new WhatsAppPostStep(0, new TimeOnly(15, 30), "Einlass")]
                    ),
                ],
            }
        );

        Assert.Equal(
            $"{Head}*Saalreinigung*\nSa 12.6. · 15:00 Uhr\n\n15:30 Einlass\n\n{LinkLine}",
            post.Text
        );
    }

    [Theory]
    [InlineData(WhatsAppBadge.Appointment, "📅 `FCC · TERMIN`")]
    [InlineData(WhatsAppBadge.Training, "💃 `FCC · TRAINING`")]
    [InlineData(WhatsAppBadge.Trip, "🚌 `FCC · AUSFLUG`")]
    [InlineData(WhatsAppBadge.Event, "🎉 `FCC · VERANSTALTUNG`")]
    [InlineData(WhatsAppBadge.Announcement, "📌 `FCC · AUSHANG`")]
    public void Should_OpenWithTheBadgeOfTheHost_When_ThePostIsRendered(
        WhatsAppBadge badge,
        string expectedHead
    )
    {
        var post = WhatsAppPostText.Render(Draft() with { Badge = badge });

        Assert.Equal($"{expectedHead}\n*Saalreinigung*\n\n{LinkLine}", post.Text);
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
