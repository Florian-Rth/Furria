using Furria.Tests.Common.Builder;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;

namespace Furria.Api.Tests.Studio;

internal static class StudioSeeds
{
    internal static Action<SeedContextBuilder> GardeWithDancers(DateOnly today) =>
        builder =>
        {
            PlannerWithGardeAdmin(today)(builder);
            builder.Identity(identity =>
                identity.AddAccount(Anna).AddAccount(Ben).AddAccount(Clara)
            );
        };
}
