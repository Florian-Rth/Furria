using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;

namespace Furria.Api.Tests.RunningOrders;

internal static class RunningOrderSeeds
{
    internal const string Planner = "paula";
    internal const string Anna = "anna";
    internal const string Ben = "ben";
    internal const string Clara = "clara";
    internal const string Dora = "dora";
    internal const string Garde = "garde";
    internal const string GardeAdmin = "gerd";
    internal const string Elferrat = "elferrat";
    internal const string ArchivedGroup = "alte-garde";
    internal const string Gala = "gala";
    internal const string SummerParty = "sommerfest";
    internal const int GalaInDays = 30;
    internal const int RunningSessionYear = 2026;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    internal static readonly DateTimeOffset InTheRunningSession = ClubClock.At(
        new DateOnly(2026, 12, 1),
        new TimeOnly(12, 0)
    );
    internal static readonly DateTimeOffset AfterItsAshWednesday = ClubClock.At(
        new DateOnly(2027, 3, 1),
        new TimeOnly(12, 0)
    );

    internal static Action<SeedContextBuilder> PlannerWithGala(
        DateOnly today,
        Action<ClubSeedBuilder>? arrangeClub = null
    ) =>
        builder =>
            builder
                .Identity(identity =>
                    identity
                        .AddPerson(Planner, "Paula", "Planer")
                        .AddAccount(Planner)
                        .AddMembership("paula-first", Planner, JoinedIn2017)
                        .AddPerson(Anna, "Anna", "Albers")
                        .AddPerson(Ben, "Ben", "Bauer")
                        .AddPerson(Clara, "Clara", "Christ")
                        .AddPerson(Dora, "Dora", "Dreher")
                )
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "ablauf",
                        "paula-ablauf",
                        "Ablauf",
                        Planner,
                        FurriaPermissions.EventsRunningOrder
                    )
                )
                .Groups(groups =>
                    groups
                        .AddGroup(Garde, "Tanzgarde")
                        .AddGroup(ArchivedGroup, "Alte Garde", archivedOn: today.AddDays(-30))
                        .AddGroupMembership("anna-garde", Garde, Anna, today.AddDays(-400))
                        .AddGroupMembership(
                            "ben-garde",
                            Garde,
                            Ben,
                            today.AddDays(-400),
                            today.AddDays(GalaInDays - 10)
                        )
                        .AddGroupMembership(
                            "dora-garde",
                            Garde,
                            Dora,
                            today.AddDays(GalaInDays - 5)
                        )
                )
                .Club(club =>
                {
                    club.AddVenue("buergerhaus", "Bürgerhaus")
                        .AddEvent(
                            Gala,
                            "1. Prunksitzung",
                            EveningOf(today.AddDays(GalaInDays)),
                            "buergerhaus"
                        )
                        .AddEvent(
                            SummerParty,
                            "Sommerfest",
                            EveningOf(today.AddDays(GalaInDays + 60)),
                            "buergerhaus"
                        );
                    arrangeClub?.Invoke(club);
                });

    internal static Action<SeedContextBuilder> PlannerWithGardeAdmin(DateOnly today) =>
        builder =>
        {
            PlannerWithGala(today)(builder);
            builder
                .Identity(identity =>
                    identity.AddPerson(GardeAdmin, "Gerd", "Gardist").AddAccount(GardeAdmin)
                )
                .Groups(groups =>
                    groups
                        .AddGroup(Elferrat, "Elferrat")
                        .AddGroupAdmin("gerd-leitet", Garde, GardeAdmin, "Trainer")
                );
        };

    private static DateTimeOffset EveningOf(DateOnly day) =>
        ClubClock.At(day, new TimeOnly(19, 11));
}
