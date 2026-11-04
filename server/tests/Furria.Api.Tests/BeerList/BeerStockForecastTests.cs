using Furria.Core.BeerList;
using Xunit;

namespace Furria.Api.Tests.BeerList;

public sealed class BeerStockForecastTests
{
    private static readonly DateOnly Today = new(2026, 11, 4);

    [Theory]
    [InlineData(21, 21, 21)]
    [InlineData(10, 42, 5)]
    [InlineData(7, 3, 49)]
    [InlineData(5, 4, 26)]
    public void Should_ProjectTheEmptyDayFromTheRecentPace_When_CratesWereTaken(
        int stock,
        int cratesTakenInPaceWindow,
        int daysUntilEmpty
    )
    {
        Assert.Equal(
            Today.AddDays(daysUntilEmpty),
            BeerStockForecast.ProjectedEmptyOn(stock, cratesTakenInPaceWindow, Today)
        );
    }

    [Fact]
    public void Should_ProjectToday_When_TheStockIsAlreadyEmpty()
    {
        Assert.Equal(Today, BeerStockForecast.ProjectedEmptyOn(0, 12, Today));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(30)]
    public void Should_ProjectNothing_When_NoCrateWasTakenInThePaceWindow(int stock)
    {
        Assert.Null(BeerStockForecast.ProjectedEmptyOn(stock, 0, Today));
    }
}
