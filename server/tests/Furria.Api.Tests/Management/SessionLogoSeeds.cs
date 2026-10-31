using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;

namespace Furria.Api.Tests.Management;

internal static class SessionLogoSeeds
{
    internal const string Keeper = "clara";
    internal const string Member = "max";
    internal const string Running = "laufende";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    internal static Action<SeedContextBuilder> RunningSessionWithKeeper() =>
        builder =>
            builder
                .Identity(identity =>
                    identity
                        .AddPerson(Keeper, "Clara", "Chronik")
                        .AddAccount(Keeper)
                        .AddMembership("clara-first", Keeper, JoinedIn2017)
                        .AddPerson(Member, "Max", "Mitglied")
                        .AddAccount(Member)
                        .AddMembership("max-first", Member, JoinedIn2017)
                )
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "vereinsdaten",
                        "clara-vereinsdaten",
                        "Vereinsdaten",
                        Keeper,
                        FurriaPermissions.ClubManage
                    )
                )
                .Club(club =>
                    club.AddSession(Running, 2026, 53, "FURRIA — Der Mittelpunkt des Universums")
                );
}
