using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class SessionSectionsTests
{
    private static readonly SessionNumbers Numbers = new(
        new Dictionary<int, int?> { [2025] = 71, [2024] = null }
    );

    [Fact]
    public void Should_OpenTheNewSession_When_BerlinHasPassedMidnightIntoTheEleventh()
    {
        var sections = DatedSectionsOf(new Item("opening", Utc(2025, 11, 10, 23, 30)));

        Assert.Equal(2025, Assert.Single(sections).SessionStartYear);
    }

    [Fact]
    public void Should_KeepTheOldSession_When_BerlinIsStillOnTheTenth()
    {
        var sections = DatedSectionsOf(new Item("eve", Utc(2025, 11, 10, 22, 59)));

        Assert.Equal(2024, Assert.Single(sections).SessionStartYear);
    }

    [Fact]
    public void Should_ListTheSessionsNewestFirstWithTheirNumbers_When_ItemsSpanSessions()
    {
        var sections = DatedSectionsOf(
            new Item("old", Utc(2024, 12, 1, 12, 0)),
            new Item("new", Utc(2025, 11, 20, 12, 0)),
            new Item("ancient", Utc(2019, 1, 10, 12, 0))
        );

        Assert.Equal(
            [(2025, (int?)71), (2024, null), (2018, null)],
            sections.Select(section => (section.SessionStartYear, section.SessionNumber))
        );
    }

    [Fact]
    public void Should_LeadWithTheUndatedSection_When_UndatedComesFirst()
    {
        var sections = SectionsOf(UndatedSection.First, Mixed());

        Assert.Equal(
            [(null, null), (2025, (int?)71), (2024, null)],
            sections.Select(section => (section.SessionStartYear, section.SessionNumber))
        );
    }

    [Fact]
    public void Should_FileAnItemUnderItsNamedSession_When_ItCarriesASessionInsteadOfADate()
    {
        var sections = SessionSections.Of(
            [1985, 2025, (int?)null],
            year => SessionDate.In(year),
            Numbers,
            UndatedSection.Last,
            years => years.OrderBy(year => year)
        );

        Assert.Equal(
            [(2025, (int?)71), (1985, null), (null, null)],
            sections.Select(section => (section.SessionStartYear, section.SessionNumber))
        );
    }

    private static IReadOnlyList<DatedSessionSection<Item>> DatedSectionsOf(params Item[] items) =>
        SessionSections.DatedOf(items, item => SessionDate.At(item.At), Numbers, NewestFirst);

    private static IReadOnlyList<SessionSection<Item>> SectionsOf(
        UndatedSection undated,
        params Item[] items
    ) => SessionSections.Of(items, item => SessionDate.At(item.At), Numbers, undated, NewestFirst);

    private static Item[] Mixed() =>
        [
            new("old", Utc(2025, 3, 1, 12, 0)),
            new("draft", null),
            new("new", Utc(2026, 1, 6, 12, 0)),
        ];

    private static IOrderedEnumerable<Item> NewestFirst(IEnumerable<Item> items) =>
        items.OrderByDescending(item => item.At);

    private static DateTimeOffset Utc(int year, int month, int day, int hour, int minute) =>
        new(year, month, day, hour, minute, 0, TimeSpan.Zero);

    private sealed record Item(string Name, DateTimeOffset? At);
}
