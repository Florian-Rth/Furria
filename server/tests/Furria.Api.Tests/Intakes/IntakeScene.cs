using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;

namespace Furria.Api.Tests.Intakes;

internal static class IntakeScene
{
    internal const string Manager = "vorstand";
    internal const string GuardTrainer = "trainerin";
    internal const string ShowTrainer = "trainer";
    internal const string Member = "mitglied";
    internal const string Guard = "garde";
    internal const string Show = "showtanz";
    internal const string Retired = "altgarde";

    internal static Action<SeedContextBuilder> With(Action<IntakeSeedBuilder>? intakes = null) =>
        builder =>
            builder
                .Identity(identity =>
                    identity
                        .AddAccount(Manager)
                        .AddAccount(GuardTrainer)
                        .AddAccount(ShowTrainer)
                        .AddAccount(Member)
                        .AddMembership("mitglied-membership", Member)
                )
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "register",
                        "register-holding",
                        "Mitgliederverwaltung",
                        Manager,
                        FurriaPermissions.PersonsManage
                    )
                )
                .Groups(groups =>
                    groups
                        .AddGroup(Guard, "Kindergarde")
                        .AddGroup(Show, "Showtanz")
                        .AddGroup(Retired, "Altgarde", archivedOn: new DateOnly(2024, 3, 1))
                        .AddGroupAdmin("garde-admin", Guard, GuardTrainer)
                        .AddGroupAdmin("showtanz-admin", Show, ShowTrainer)
                )
                .Intakes(intakes ?? (_ => { }));
}
