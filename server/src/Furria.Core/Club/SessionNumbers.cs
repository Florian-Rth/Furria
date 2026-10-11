using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public sealed class SessionNumbers
{
    private readonly IReadOnlyDictionary<int, int?> _numbersByStartYear;

    public SessionNumbers(IReadOnlyDictionary<int, int?> numbersByStartYear)
    {
        _numbersByStartYear = numbersByStartYear;
    }

    [Pure]
    public int? Of(int sessionStartYear) => _numbersByStartYear.GetValueOrDefault(sessionStartYear);
}
