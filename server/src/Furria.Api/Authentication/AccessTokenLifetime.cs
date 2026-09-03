using System.Diagnostics.Contracts;

namespace Furria.Api.Authentication;

public static class AccessTokenLifetime
{
    [Pure]
    public static bool IsCurrent(DateTime? notBefore, DateTime? expires, DateTime now) =>
        expires is not null && expires > now && (notBefore is null || notBefore <= now);
}
