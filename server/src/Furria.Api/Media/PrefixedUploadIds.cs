using System.Diagnostics.Contracts;
using System.Globalization;
using tusdotnet.Interfaces;

namespace Furria.Api.Media;

public sealed class PrefixedUploadIds : ITusFileIdProvider
{
    public const char UploadLinkPrefix = 'l';
    public const char IntakePrefix = 'i';

    private const char Separator = '-';
    private const string GuidFormat = "N";

    private readonly char _prefix;
    private readonly int _scopeId;

    public PrefixedUploadIds(char prefix, int scopeId)
    {
        _prefix = prefix;
        _scopeId = scopeId;
    }

    public Task<string> CreateId(string metadata) =>
        Task.FromResult(
            string.Create(
                CultureInfo.InvariantCulture,
                $"{_prefix}{_scopeId}{Separator}{Guid.NewGuid().ToString(GuidFormat)}"
            )
        );

    public Task<bool> ValidateId(string fileId) =>
        Task.FromResult(ScopeIdOf(_prefix, fileId) is not null);

    [Pure]
    public static int? ScopeIdOf(char prefix, string? fileId)
    {
        var separator = fileId?.IndexOf(Separator) ?? -1;
        return
            separator > 1
            && fileId![0] == prefix
            && int.TryParse(
                fileId.AsSpan(1, separator - 1),
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var scopeId
            )
            && scopeId > 0
            && Guid.TryParseExact(fileId.AsSpan(separator + 1), GuidFormat, out _)
            ? scopeId
            : null;
    }
}
