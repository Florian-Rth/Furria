using System.Diagnostics.Contracts;
using System.Globalization;
using System.Security.Claims;
using Furria.Api.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Furria.Api.Authentication;

public static class ActingAccount
{
    private const string InactiveAccountMessage =
        "The account behind the access token is disabled or no longer exists.";

    public static async Task ResolveAsync(TokenValidatedContext context)
    {
        var ct = context.HttpContext.RequestAborted;
        var authorizer =
            context.HttpContext.RequestServices.GetRequiredService<PermissionAuthorizer>();
        if (
            context.Principal?.AccountId() is not { } accountId
            || !await authorizer.IsActiveAccountAsync(accountId, ct)
        )
        {
            context.Fail(InactiveAccountMessage);
            return;
        }

        context.Principal = ActingAs(
            context.Principal,
            await authorizer.ActivePersonIdAsync(accountId, ct)
        );
    }

    [Pure]
    private static ClaimsPrincipal ActingAs(ClaimsPrincipal principal, int? personId)
    {
        var identity = new ClaimsIdentity(
            principal.Claims.Where(claim => claim.Type != FurriaClaimTypes.PersonId),
            principal.Identity?.AuthenticationType
        );
        if (personId is { } person)
            identity.AddClaim(
                new Claim(FurriaClaimTypes.PersonId, person.ToString(CultureInfo.InvariantCulture))
            );

        return new ClaimsPrincipal(identity);
    }
}
