using System.Diagnostics.Contracts;
using Furria.Core.Halls;

namespace Furria.Infrastructure.Halls;

public sealed record SeatingRules(
    SeatingStandard Standard,
    IReadOnlyDictionary<int, TableType> TableTypes
)
{
    [Pure]
    public TablePlanCount CountOf(TablePlanDocument document) =>
        TableChairs.CountOf(document, TableTypes, Standard);
}
