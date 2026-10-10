using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;

namespace Furria.Api.Tests.News;

internal static class NewsSeeds
{
    internal const string Editor = "nele";

    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);

    internal static SeedContextBuilder WithNewsEditor(this SeedContextBuilder builder) =>
        builder
            .Identity(identity =>
                identity
                    .AddPerson(Editor, "Nele", "Neumann")
                    .AddAccount(Editor)
                    .AddMembership("nele-first", Editor, JoinedIn2015)
            )
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "aktuelles",
                    "nele-aktuelles",
                    "Aktuelles",
                    Editor,
                    FurriaPermissions.NewsManage
                )
            );
}
