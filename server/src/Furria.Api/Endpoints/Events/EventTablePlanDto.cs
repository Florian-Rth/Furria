using System.Diagnostics.Contracts;
using Furria.Core.Halls;

namespace Furria.Api.Endpoints.Events;

public sealed record EventTablePlanDto
{
    public required int Tables { get; init; }

    public required int Chairs { get; init; }

    [Pure]
    public static EventTablePlanDto? From(TablePlanCount? count) =>
        count is null ? null : new() { Tables = count.Tables, Chairs = count.Chairs };
}
