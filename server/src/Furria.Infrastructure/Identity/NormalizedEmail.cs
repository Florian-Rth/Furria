using System.Diagnostics.Contracts;

namespace Furria.Infrastructure.Identity;

public static class NormalizedEmail
{
    [Pure]
    public static string Of(string email) => email.Trim().ToUpperInvariant();
}
