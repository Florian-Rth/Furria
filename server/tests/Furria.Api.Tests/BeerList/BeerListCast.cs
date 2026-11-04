using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;

namespace Furria.Api.Tests.BeerList;

internal static class BeerListCast
{
    internal const string Warden = "greta";
    internal const string Drinker = "mira";
    internal const string Pot = "topf";

    private static readonly DateOnly MemberSince2018 = new(2018, 4, 1);

    internal static SeedContextBuilder WardenAndDrinker(SeedContextBuilder builder) =>
        builder
            .Identity(identity =>
                identity
                    .AddPerson(Warden, "Greta", "Gruber")
                    .AddAccount(Warden)
                    .AddPerson(Drinker, "Mira", "Maier")
                    .AddAccount(Drinker)
                    .AddMembership("mira-first", Drinker, MemberSince2018)
            )
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "getraenkewart",
                    "greta-getraenkewart",
                    "Getränkewart",
                    Warden,
                    FurriaPermissions.BeerListManage
                )
            );
}
