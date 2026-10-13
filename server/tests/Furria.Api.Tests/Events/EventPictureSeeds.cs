using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;

namespace Furria.Api.Tests.Events;

internal static class EventPictureSeeds
{
    internal const string Keeper = "vera";
    internal const string Member = "max";
    internal const string Gala = "first-gala";
    internal const string Meeting = "club-meeting";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateTimeOffset AtTheFirstGala = new(
        2027,
        1,
        16,
        18,
        11,
        0,
        TimeSpan.Zero
    );

    internal static Action<SeedContextBuilder> GalaWithKeeper(
        Action<GallerySeedBuilder>? arrangeGallery = null
    ) =>
        builder =>
            builder
                .Identity(identity =>
                    identity
                        .AddPerson(Keeper, "Vera", "Anstalter")
                        .AddAccount(Keeper)
                        .AddMembership("vera-first", Keeper, JoinedIn2017)
                        .AddPerson(Member, "Max", "Mitglied")
                        .AddAccount(Member)
                        .AddMembership("max-first", Member, JoinedIn2017)
                )
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "veranstaltungen",
                        "vera-veranstaltungen",
                        "Veranstaltungen",
                        Keeper,
                        FurriaPermissions.EventsManage
                    )
                )
                .Club(club =>
                    club.AddVenue("buergerhaus", "Bürgerhaus")
                        .AddEvent(Gala, "1. Prunksitzung", AtTheFirstGala, "buergerhaus")
                        .AddCalendarEntry(Meeting, "Vereinssitzung", AtTheFirstGala.AddDays(4))
                )
                .Gallery(gallery => arrangeGallery?.Invoke(gallery));
}
