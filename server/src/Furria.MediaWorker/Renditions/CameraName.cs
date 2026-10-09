using System.Diagnostics.Contracts;

namespace Furria.MediaWorker.Renditions;

public static class CameraName
{
    [Pure]
    public static string? Of(string? make, string? model) =>
        (make, model) switch
        {
            (null, null) => null,
            (_, null) => make,
            (null, _) => model,
            _ when model.StartsWith(make, StringComparison.OrdinalIgnoreCase) => model,
            _ => $"{make} {model}",
        };
}
