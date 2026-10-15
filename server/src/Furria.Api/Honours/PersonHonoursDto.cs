using System.Diagnostics.Contracts;
using Furria.Application.Registry;

namespace Furria.Api.Honours;

public sealed record PersonHonoursDto
{
    public required int Sessions { get; init; }

    public required IReadOnlyList<PersonFunctionDto> Functions { get; init; }

    [Pure]
    public static PersonHonoursDto From(PersonHonoursDetails honours) =>
        new() { Sessions = honours.Sessions, Functions = [.. honours.Functions.Select(ToDto)] };

    [Pure]
    private static PersonFunctionDto ToDto(PersonFunctionDetails function) =>
        new()
        {
            Kind = function.Kind,
            Name = function.Name,
            Icon = function.Icon,
            Tone = function.Tone,
        };
}
