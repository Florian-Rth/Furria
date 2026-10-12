using System.Diagnostics.Contracts;
using Furria.Core.Identity;
using Furria.Core.Media;

namespace Furria.Core.Website;

public sealed class WebsitePicture
{
    public const int AltLength = 300;
    public const double NarrowestAspect = 0.25;
    public const double WidestAspect = 4;

    public string SlotKey { get; set; } = "";

    public int Position { get; set; }

    public int MediaItemId { get; set; }

    public double Aspect { get; set; }

    public string? Alt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public int? UpdatedByPersonId { get; set; }

    public MediaItem? MediaItem { get; set; }

    public Person? UpdatedBy { get; set; }

    [Pure]
    public static bool IsWellFormedAspect(double aspect) =>
        double.IsFinite(aspect) && aspect is >= NarrowestAspect and <= WidestAspect;
}
