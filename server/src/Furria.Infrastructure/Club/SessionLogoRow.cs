using Furria.Core.Media;

namespace Furria.Infrastructure.Club;

public sealed record SessionLogoRow(
    int SessionId,
    int MediaItemId,
    MediaItemState State,
    DateTimeOffset? RenderedAt,
    int? Width,
    int? Height
);
