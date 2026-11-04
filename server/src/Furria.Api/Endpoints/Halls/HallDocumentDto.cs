using System.Diagnostics.Contracts;
using Furria.Core.Halls;

namespace Furria.Api.Endpoints.Halls;

public sealed record HallDocumentDto
{
    public required IReadOnlyList<HallElementDto> Elements { get; init; }

    [Pure]
    public static HallDocumentDto Of(HallDocument document) =>
        new() { Elements = [.. document.Elements.Select(HallElementDto.Of)] };

    [Pure]
    public HallDocument ToDocument() =>
        new() { Elements = [.. Elements.Select(element => element.ToElement())] };
}
