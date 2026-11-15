using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Push;

namespace Furria.Infrastructure.BeerList;

internal static class BeerListPushes
{
    private const string TabReminderTag = "beer-tab";
    private const string StockWarningTag = "beer-stock";

    internal const string MemberBeerListPath = "/beer-list";
    internal const string HubStockPanelPath = "/beer-list/manage/stock";

    private static readonly CultureInfo German = CultureInfo.GetCultureInfo("de-DE");
    private static readonly TimeSpan TimeToLive = TimeSpan.FromDays(1);

    [Pure]
    internal static PushMessage TabReminder(int openCrates, int openCents) =>
        new()
        {
            Title = "Bier bezahlen",
            Body = string.Create(
                German,
                $"Du hast noch {CratesOf(openCrates)} offen, zusammen {openCents / 100m:N2} €."
            ),
            Url = MemberBeerListPath,
            Tag = TabReminderTag,
            TimeToLive = TimeToLive,
        };

    [Pure]
    internal static PushMessage StockWarning(
        IReadOnlyList<BeerDrinkRunningLow> drinks,
        DateOnly today
    ) =>
        new()
        {
            Title = drinks.Count == 1 ? $"{drinks[0].Name} wird knapp" : "Getränke werden knapp",
            Body =
                drinks.Count == 1
                    ? StockWarningBody(drinks[0], today)
                    : string.Join("\n", drinks.Select(drink => StockWarningLine(drink, today))),
            Url = HubStockPanelPath,
            Tag = StockWarningTag,
            TimeToLive = TimeToLive,
        };

    [Pure]
    private static string StockWarningBody(BeerDrinkRunningLow drink, DateOnly today)
    {
        if (drink.Crates <= 0)
            return "Keine Kiste mehr da.";

        return drink.ProjectedEmptyOn <= today
            ? $"Noch {CratesOf(drink.Crates)} da, das reicht nur noch heute."
            : string.Create(
                German,
                $"Noch {CratesOf(drink.Crates)} da, das reicht etwa bis {drink.ProjectedEmptyOn:dddd, d. MMMM}."
            );
    }

    [Pure]
    private static string StockWarningLine(BeerDrinkRunningLow drink, DateOnly today)
    {
        if (drink.Crates <= 0)
            return $"{drink.Name}: keine Kiste mehr da.";

        return drink.ProjectedEmptyOn <= today
            ? $"{drink.Name}: noch {CratesOf(drink.Crates)}, reicht nur noch heute."
            : string.Create(
                German,
                $"{drink.Name}: noch {CratesOf(drink.Crates)}, reicht etwa bis {drink.ProjectedEmptyOn:dddd, d. MMMM}."
            );
    }

    [Pure]
    private static string CratesOf(int count) => count == 1 ? "1 Kiste" : $"{count} Kisten";
}
