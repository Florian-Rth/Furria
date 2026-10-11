using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class SessionSections
{
    private const int LeadingRank = -1;
    private const int DatedRank = 0;
    private const int TrailingRank = 1;

    [Pure]
    public static IReadOnlyList<SessionSection<T>> Of<T>(
        IEnumerable<T> items,
        Func<T, SessionDate> dateOf,
        SessionNumbers sessionNumbers,
        UndatedSection undated,
        Func<IEnumerable<T>, IOrderedEnumerable<T>> order
    ) =>
        [
            .. items
                .GroupBy(item => dateOf(item).SessionStartYear)
                .OrderBy(section => RankOf(section.Key, undated))
                .ThenByDescending(section => section.Key)
                .Select(section => new SessionSection<T>(
                    section.Key,
                    section.Key is { } year ? sessionNumbers.Of(year) : null,
                    [.. order(section)]
                )),
        ];

    [Pure]
    public static IReadOnlyList<DatedSessionSection<T>> DatedOf<T>(
        IEnumerable<T> items,
        Func<T, SessionDate> dateOf,
        SessionNumbers sessionNumbers,
        Func<IEnumerable<T>, IOrderedEnumerable<T>> order
    ) =>
        [
            .. items
                .Select(item => (Item: item, Year: dateOf(item).SessionStartYear))
                .Where(dated => dated.Year is not null)
                .GroupBy(dated => dated.Year!.Value, dated => dated.Item)
                .OrderByDescending(section => section.Key)
                .Select(section => new DatedSessionSection<T>(
                    section.Key,
                    sessionNumbers.Of(section.Key),
                    [.. order(section)]
                )),
        ];

    [Pure]
    private static int RankOf(int? sessionStartYear, UndatedSection undated) =>
        sessionStartYear is not null ? DatedRank
        : undated == UndatedSection.First ? LeadingRank
        : TrailingRank;
}
