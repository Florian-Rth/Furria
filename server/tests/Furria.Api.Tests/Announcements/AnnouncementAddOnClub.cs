using FastEndpoints;
using Furria.Api.Endpoints.Announcements;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Announcements;

internal static class AnnouncementAddOnClub
{
    internal const string Title = "Sommerfest";
    internal const string SnackQuestion = "Was bringst du mit?";
    internal const string HelperList = "Wer hilft beim Aufbau?";

    internal static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);
    internal static readonly DateOnly ValidUntil = new(2027, 1, 31);
    internal static readonly DateTimeOffset AfterTheLastDay = new(
        2027,
        2,
        1,
        0,
        0,
        0,
        TimeSpan.Zero
    );

    private const string Body = "Wir feiern im Juli.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    internal static Task<SeededContext> BuildAsync(
        ApiTestFixture fixture,
        CancellationToken ct,
        Action<ClubSeedBuilder>? more = null
    ) =>
        fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Aushang")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                            .AddPerson("alice", "Alice", "Autorin")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Mitglied")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                            .AddPerson("mara", "Mara", "Offen")
                            .AddAccount("mara")
                            .AddMembership("mara-first", "mara", JoinedIn2017)
                            .AddPerson("paula", "Paula", "Pause")
                            .AddAccount("paula")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                            .AddMembershipPause("paula-pause", "paula-first", 2026, 2026)
                            .AddPerson("rolf", "Rolf", "Leser")
                            .AddAccount("rolf")
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "aushangwart",
                                "ilka-aushangwart",
                                "Aushangwart",
                                "ilka",
                                FurriaPermissions.AnnouncementsPost
                            )
                            .AddRoleWithHolder(
                                "leser",
                                "rolf-leser",
                                "Leser",
                                "rolf",
                                FurriaPermissions.ClubRead
                            )
                    )
                    .Club(club =>
                    {
                        club.AddAnnouncement(
                                "fest",
                                "alice",
                                Title,
                                Body,
                                Now.AddDays(-2),
                                ValidUntil,
                                new AnnouncementAttendanceIntent(Position: 0)
                            )
                            .AddAnnouncementResponse(
                                "chris-fest",
                                "fest",
                                "chris",
                                AttendanceAnswer.Yes
                            )
                            .AddAnnouncementPoll(
                                "snack",
                                "fest",
                                SnackQuestion,
                                ["Kuchen", "Obst"],
                                position: 1
                            )
                            .AddCalendarPollVote("snack", "Kuchen", "chris")
                            .AddAnnouncementSignUpList("helpers", "fest", HelperList, position: 2)
                            .AddCalendarSignUpLine("chris-helps", "helpers", "chris", "Bänke");
                        more?.Invoke(club);
                    }),
            ct
        );

    internal static async Task<HttpResponseMessage> AtNowAsync(
        ApiTestFixture fixture,
        Func<Task<HttpResponseMessage>> call
    ) => await AtAsync(fixture, Now, call);

    internal static async Task<HttpResponseMessage> AtAsync(
        ApiTestFixture fixture,
        DateTimeOffset instant,
        Func<Task<HttpResponseMessage>> call
    )
    {
        HttpResponseMessage? response = null;
        await fixture.AtInstantAsync(instant, async () => response = await call());
        return response ?? throw new InvalidOperationException("No response.");
    }

    internal static async Task<GetAnnouncementsResponse> ReadAtAsync(
        ApiTestFixture fixture,
        SeededContext ctx,
        string readerAlias,
        DateTimeOffset instant,
        CancellationToken ct
    )
    {
        GetAnnouncementsResponse? read = null;
        await fixture.AtInstantAsync(
            instant,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(readerAlias, ct);
                var (response, result) = await client.GETAsync<
                    GetAnnouncements,
                    GetAnnouncementsResponse
                >();
                response.EnsureSuccessStatusCode();
                read = result;
            }
        );
        return read ?? throw new InvalidOperationException("No announcements.");
    }
}
