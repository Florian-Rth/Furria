using Furria.Core.Media;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Media;

public sealed class MediaFiles
{
    private readonly MediaRoot _root;
    private readonly ILogger<MediaFiles> _logger;

    public MediaFiles(MediaRoot root, ILogger<MediaFiles> logger)
    {
        _root = root;
        _logger = logger;
    }

    public string OriginalPathOf(Guid storageKey) =>
        _root.FullPathOf(MediaPaths.OriginalOf(storageKey));

    public void Discard(IEnumerable<Guid> storageKeys)
    {
        foreach (var storageKey in storageKeys)
            DiscardOne(storageKey);
    }

    private void DiscardOne(Guid storageKey)
    {
        try
        {
            _root.DeleteFilesOf(storageKey);
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            _logger.LogWarning(
                "Media files of a deleted item left behind, failure {FailureType}",
                exception.GetType().Name
            );
        }
    }
}
