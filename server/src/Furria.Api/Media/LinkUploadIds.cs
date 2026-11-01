using System.Diagnostics.Contracts;
using System.Globalization;
using tusdotnet.Interfaces;

namespace Furria.Api.Media;

public sealed class LinkUploadIds : ITusFileIdProvider
{
    private const char Prefix = 'l';
    private const char Separator = '-';
    private const string GuidFormat = "N";

    private readonly int _uploadLinkId;

    public LinkUploadIds(int uploadLinkId)
    {
        _uploadLinkId = uploadLinkId;
    }

    public Task<string> CreateId(string metadata) =>
        Task.FromResult(
            string.Create(
                CultureInfo.InvariantCulture,
                $"{Prefix}{_uploadLinkId}{Separator}{Guid.NewGuid().ToString(GuidFormat)}"
            )
        );

    public Task<bool> ValidateId(string fileId) =>
        Task.FromResult(UploadLinkIdOf(fileId) is not null);

    [Pure]
    public static int? UploadLinkIdOf(string? fileId)
    {
        var separator = fileId?.IndexOf(Separator) ?? -1;
        return
            separator > 1
            && fileId![0] == Prefix
            && int.TryParse(
                fileId.AsSpan(1, separator - 1),
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var uploadLinkId
            )
            && uploadLinkId > 0
            && Guid.TryParseExact(fileId.AsSpan(separator + 1), GuidFormat, out _)
            ? uploadLinkId
            : null;
    }
}
