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
        int crates,
        DateOnly projectedEmptyOn,
        DateOnly today
    ) =>
        new()
        {
            Title = "Das Bier wird knapp",
            Body = StockWarningBody(crates, projectedEmptyOn, today),
            Url = HubStockPanelPath,
            Tag = StockWarningTag,
            TimeToLive = TimeToLive,
        };

    [Pure]
    private static string StockWarningBody(int crates, DateOnly projectedEmptyOn, DateOnly today)
    {
        if (crates <= 0)
            return "Keine Kiste mehr da.";

        return projectedEmptyOn <= today
            ? $"Noch {CratesOf(crates)} da, das reicht nur noch heute."
            : string.Create(
                German,
                $"Noch {CratesOf(crates)} da, das reicht etwa bis {projectedEmptyOn:dddd, d. MMMM}."
            );
    }

    [Pure]
    private static string CratesOf(int count) => count == 1 ? "1 Kiste" : $"{count} Kisten";
}
