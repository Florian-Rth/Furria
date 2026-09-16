using System.Globalization;
using System.Security.Claims;
using Furria.Application.Identity;

namespace Furria.Api.Authorization;

public static class ClaimsPrincipalExtensions
{
    public static int? AccountId(this ClaimsPrincipal principal) =>
        NumericClaim(principal, FurriaClaimTypes.AccountId);

    public static int? PersonId(this ClaimsPrincipal principal) =>
        NumericClaim(principal, FurriaClaimTypes.PersonId);

    private static int? NumericClaim(ClaimsPrincipal principal, string claimType)
    {
        var claim = principal.FindFirstValue(claimType);

        return int.TryParse(claim, CultureInfo.InvariantCulture, out var value) ? value : null;
    }
}
