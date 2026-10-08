using System.Text.Json;
using System.Text.Json.Serialization;
using Furria.Core.Events;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class EventWireNamesTests
{
    private static readonly JsonSerializerOptions ApiOptions = new()
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    [Theory]
    [InlineData(EventSalesStatus.Announced, "announced")]
    [InlineData(EventSalesStatus.PresaleScheduled, "presaleScheduled")]
    [InlineData(EventSalesStatus.Available, "available")]
    [InlineData(EventSalesStatus.FewLeft, "fewLeft")]
    [InlineData(EventSalesStatus.SoldOut, "soldOut")]
    [InlineData(EventSalesStatus.Cancelled, "cancelled")]
    public void Should_CarryTheCamelCaseName_When_AVerkaufsstandGoesOnTheWire(
        EventSalesStatus status,
        string wireName
    ) => Assert.Equal($"\"{wireName}\"", JsonSerializer.Serialize(status, ApiOptions));

    [Fact]
    public void Should_PinEveryValue_When_TheVerkaufsstaendeAreCounted() =>
        Assert.Equal(6, Enum.GetValues<EventSalesStatus>().Length);
}
