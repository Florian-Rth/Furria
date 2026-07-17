using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;

namespace Furria.Application.PreviewAccess;

public sealed class PreviewAccessService
{
    private readonly string _configuredPassword;

    public PreviewAccessService(IOptions<PreviewAccessOptions> options)
    {
        _configuredPassword = options.Value.Password;
    }

    public bool ValidatePassword(string password)
    {
        // An unconfigured password must never grant access - deny instead of comparing.
        if (_configuredPassword.Length == 0)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(_configuredPassword),
            Encoding.UTF8.GetBytes(password)
        );
    }
}
