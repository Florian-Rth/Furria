using Furria.Core.Events;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class EventSalesTests
{
    private static readonly DateTimeOffset Evening = new(2027, 1, 16, 18, 11, 0, TimeSpan.Zero);

    [Theory]
    [InlineData(EventSalesStatus.Announced, false)]
    [InlineData(EventSalesStatus.PresaleScheduled, true)]
    [InlineData(EventSalesStatus.Available, true)]
    [InlineData(EventSalesStatus.FewLeft, true)]
    [InlineData(EventSalesStatus.SoldOut, false)]
    [InlineData(EventSalesStatus.Cancelled, false)]
    public void Should_ShowThePresalePlacesOnlyWhileTicketsCanBeHad_When_TheEveningIsAhead(
        EventSalesStatus status,
        bool shows
    )
    {
        Assert.Equal(shows, EventSales.ShowsPresalePlaces(status, Evening, Evening.AddDays(-1)));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(60)]
    public void Should_HideThePresalePlaces_When_TheEveningHasBegun(int minutesIn)
    {
        Assert.False(
            EventSales.ShowsPresalePlaces(
                EventSalesStatus.Available,
                Evening,
                Evening.AddMinutes(minutesIn)
            )
        );
    }
}
