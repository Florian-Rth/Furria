using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;

namespace Furria.Api.Tests.Website;

internal static class WebsitePictureSeeds
{
    internal const string Publisher = "paula";

    private static readonly DateOnly JoinedIn2012 = new(2012, 11, 11);

    internal static SeedContextBuilder WithGalleryPublisher(this SeedContextBuilder builder) =>
        builder
            .Identity(identity =>
                identity
                    .AddPerson(Publisher, "Paula", "Peters")
                    .AddAccount(Publisher)
                    .AddMembership("paula-first", Publisher, JoinedIn2012)
            )
            .Roles(roles =>
                roles.AddRoleWithHolder(
                    "galerie",
                    "paula-galerie",
                    "Galerie",
                    Publisher,
                    FurriaPermissions.GalleryPublish
                )
            );
}
