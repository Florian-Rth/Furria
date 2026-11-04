using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;

namespace Furria.Api.Tests.Halls;

internal static class HallSeeds
{
    internal const string Saalchef = "sven";
    internal const string EventLead = "eva";
    internal const string Buergerhaus = "buergerhaus";
    internal const string Turnhalle = "turnhalle";
    internal const string OldHall = "alte-halle";
    internal const string Gala = "gala";
    internal const string KinderGala = "kindersitzung";
    internal const int GalaInDays = 30;
    internal const int BiertischId = 1;
    internal const int TischId = 2;
    internal const int RundId = 3;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    internal static Action<SeedContextBuilder> SaalchefWithGala(DateOnly today) =>
        builder =>
            builder
                .Identity(identity =>
                    identity
                        .AddPerson(Saalchef, "Sven", "Saalchef")
                        .AddAccount(Saalchef)
                        .AddMembership("sven-first", Saalchef, JoinedIn2017)
                        .AddPerson(EventLead, "Eva", "Eventchefin")
                        .AddAccount(EventLead)
                        .AddMembership("eva-first", EventLead, JoinedIn2017)
                )
                .Roles(roles =>
                    roles
                        .AddRoleWithHolder(
                            "saal",
                            "sven-saal",
                            "Saal & Tische",
                            Saalchef,
                            FurriaPermissions.EventsHall
                        )
                        .AddRoleWithHolder(
                            "veranstaltungen",
                            "eva-veranstaltungen",
                            "Veranstaltungen",
                            EventLead,
                            FurriaPermissions.EventsManage
                        )
                )
                .Club(club =>
                    club.AddVenue(Buergerhaus, "Bürgerhaus")
                        .AddVenue(Turnhalle, "Turnhalle", sortOrder: 2)
                        .AddVenue(
                            OldHall,
                            "Alte Halle",
                            sortOrder: 3,
                            archivedOn: today.AddDays(-10)
                        )
                        .AddEvent(
                            Gala,
                            "1. Prunksitzung",
                            EveningOf(today.AddDays(GalaInDays)),
                            Buergerhaus
                        )
                        .AddEvent(
                            KinderGala,
                            "Kindersitzung",
                            EveningOf(today.AddDays(GalaInDays + 7)),
                            Buergerhaus
                        )
                );

    private static DateTimeOffset EveningOf(DateOnly day) =>
        ClubClock.At(day, new TimeOnly(19, 11));
}
