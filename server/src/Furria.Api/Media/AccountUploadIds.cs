using System.Diagnostics.Contracts;
using System.Globalization;
using tusdotnet.Interfaces;

namespace Furria.Api.Media;

public sealed class AccountUploadIds : ITusFileIdProvider
{
    private const char Separator = '-';
    private const string GuidFormat = "N";

    private readonly int _accountId;

    public AccountUploadIds(int accountId)
    {
        _accountId = accountId;
    }

    public Task<string> CreateId(string metadata) =>
        Task.FromResult($"{_accountId}{Separator}{Guid.NewGuid().ToString(GuidFormat)}");

    public Task<bool> ValidateId(string fileId) => Task.FromResult(AccountIdOf(fileId) is not null);

    [Pure]
    public static int? AccountIdOf(string? fileId)
    {
        var separator = fileId?.IndexOf(Separator) ?? -1;
        return
            separator > 0
            && int.TryParse(
                fileId.AsSpan(0, separator),
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var accountId
            )
            && Guid.TryParseExact(fileId.AsSpan(separator + 1), GuidFormat, out _)
            ? accountId
            : null;
    }
}
