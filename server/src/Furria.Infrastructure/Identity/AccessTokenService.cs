using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text;
using Furria.Application.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Furria.Infrastructure.Identity;

public sealed class AccessTokenService
{
    private static readonly JsonWebTokenHandler Handler = new();

    private readonly TimeProvider _timeProvider;
    private readonly AccessTokenOptions _options;
    private readonly SigningCredentials _signingCredentials;

    public AccessTokenService(TimeProvider timeProvider, IOptions<AccessTokenOptions> options)
    {
        _timeProvider = timeProvider;
        _options = options.Value;
        _signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_options.SigningKey)),
            SecurityAlgorithms.HmacSha256
        );
    }

    public AccessTokenDetails Issue(int accountId, int? personId)
    {
        var issuedAt = _timeProvider.GetUtcNow();
        var expiresAt = issuedAt + _options.Lifetime;

        var token = Handler.CreateToken(
            new SecurityTokenDescriptor
            {
                Issuer = _options.Issuer,
                Audience = _options.Audience,
                IssuedAt = issuedAt.UtcDateTime,
                NotBefore = issuedAt.UtcDateTime,
                Expires = expiresAt.UtcDateTime,
                SigningCredentials = _signingCredentials,
                Claims = ClaimsOf(accountId, personId),
            }
        );

        return new AccessTokenDetails { Token = token, ExpiresAt = expiresAt };
    }

    [Pure]
    private static Dictionary<string, object> ClaimsOf(int accountId, int? personId)
    {
        var claims = new Dictionary<string, object>(StringComparer.Ordinal)
        {
            [FurriaClaimTypes.AccountId] = Format(accountId),
        };
        if (personId is { } person)
            claims[FurriaClaimTypes.PersonId] = Format(person);

        return claims;
    }

    private static string Format(int value) => value.ToString(CultureInfo.InvariantCulture);
}
