using System.Globalization;
using System.Security.Claims;
using Furria.Application.Identity;

namespace Furria.Api.Authorization;

public static class ClaimsPrincipalExtensions
{
    public static int? AccountId(this ClaimsPrincipal principal)
    {
        var claim = principal.FindFirstValue(FurriaClaimTypes.AccountId);

        return int.TryParse(claim, CultureInfo.InvariantCulture, out var accountId)
            ? accountId
            : null;
    }
}
