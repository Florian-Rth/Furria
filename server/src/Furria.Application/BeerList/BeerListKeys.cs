using Furria.Application.Authorization;

namespace Furria.Application.BeerList;

public static class BeerListKeys
{
    public static readonly string[] Readers =
    [
        FurriaPermissions.BeerListTake,
        FurriaPermissions.BeerListManage,
    ];
}
