using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;

namespace Furria.Api.Tests.Announcements;

internal static class AnnouncementMentionSeeds
{
    internal const string Author = "bea";
    internal const string Reader = "chris";
    internal const string Alice = "alice";
    internal const string Unaffiliated = "otto";
    internal const string Garde = "garde";
    internal const string Archived = "alte-garde";
    internal const string ClubMeeting = "versammlung";
    internal const string ChosenPeopleOnly = "vorstandsessen";
    internal const string Session = "sitzung";
    internal const string Unpublished = "geheim";
    internal const string Report = "bericht";
    internal const string WithdrawnReport = "zurueckgezogen";
    internal const string Photos = "fotos";
    internal const string BinnedPhotos = "papierkorb";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2020 = new(2020, 1, 1);

    internal static Action<SeedContextBuilder> MentionTargets(DateTimeOffset now) =>
        builder =>
            builder
                .Identity(identity =>
                    identity
                        .AddPerson(Author, "Bea", "Aushang")
                        .AddAccount(Author)
                        .AddMembership("bea-first", Author, JoinedIn2017)
                        .AddPerson(Reader, "Chris", "Leser")
                        .AddAccount(Reader)
                        .AddMembership("chris-first", Reader, JoinedIn2017)
                        .AddPerson(Alice, "Alice", "Muster")
                        .AddMembership("alice-first", Alice, JoinedIn2017)
                        .AddPerson(Unaffiliated, "Otto", "Fort")
                )
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "aushangwart",
                        "bea-aushangwart",
                        "Aushangwart",
                        Author,
                        FurriaPermissions.AnnouncementsPost
                    )
                )
                .Groups(groups =>
                    groups
                        .AddGroup(Garde, "Garde")
                        .AddGroup(Archived, "Alte Garde", archivedOn: ArchivedIn2020)
                )
                .Club(club =>
                    club.AddVenue("saal", "Saal")
                        .AddCalendarEntry(ClubMeeting, "Versammlung", now.AddDays(3))
                        .AddCalendarEntry(
                            ChosenPeopleOnly,
                            "Vorstandsessen",
                            now.AddDays(4),
                            audiencePersonAliases: [Alice]
                        )
                        .AddEvent(Session, "Prunksitzung", now.AddDays(20), "saal")
                        .AddEvent(
                            Unpublished,
                            "Geheimprobe",
                            now.AddDays(21),
                            "saal",
                            unpublished: true
                        )
                )
                .News(news =>
                    news.AddNewsPost(
                            Report,
                            title: "Rückblick",
                            teaser: "Kurz",
                            text: "Text",
                            publishedAt: now.AddDays(-2),
                            slug: "rueckblick"
                        )
                        .AddNewsPost(
                            WithdrawnReport,
                            title: "Alt",
                            teaser: "Kurz",
                            text: "Text",
                            publishedAt: now.AddDays(-9),
                            slug: "alt",
                            withdrawnAt: now.AddDays(-1)
                        )
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum(Photos, "Umzug")
                        .AddAlbum(BinnedPhotos, "Verworfen", binnedAt: now.AddDays(-1))
                );

    internal static string BodyMentioningEverything(SeededContext ctx) =>
        string.Join(
            " ",
            $"@[Alice](person:{ctx.Identity.People.IdOf(Alice)})",
            $"@[Otto](person:{ctx.Identity.People.IdOf(Unaffiliated)})",
            $"@[Garde](group:{ctx.Groups.Groups.IdOf(Garde)})",
            $"@[Alte](group:{ctx.Groups.Groups.IdOf(Archived)})",
            $"@[Termin](calendar-entry:{ctx.Club.CalendarEntries.IdOf(ClubMeeting)})",
            $"@[Essen](calendar-entry:{ctx.Club.CalendarEntries.IdOf(ChosenPeopleOnly)})",
            $"@[Sitzung](event:{ctx.Club.Events.IdOf(Session)})",
            $"@[Probe](event:{ctx.Club.Events.IdOf(Unpublished)})",
            $"@[Bericht](news-post:{ctx.News.Posts.IdOf(Report)})",
            $"@[Alt](news-post:{ctx.News.Posts.IdOf(WithdrawnReport)})",
            $"@[Fotos](album:{ctx.Gallery.Albums.IdOf(Photos)})",
            $"@[Weg](album:{ctx.Gallery.Albums.IdOf(BinnedPhotos)})"
        );
}
