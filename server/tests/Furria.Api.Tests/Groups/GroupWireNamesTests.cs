using System.Text.Json;
using System.Text.Json.Serialization;
using Furria.Core.Groups;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class GroupWireNamesTests
{
    private static readonly JsonSerializerOptions ApiOptions = new()
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    [Theory]
    [InlineData(GroupTone.Clay, "clay")]
    [InlineData(GroupTone.Olive, "olive")]
    [InlineData(GroupTone.Lime, "lime")]
    [InlineData(GroupTone.Fern, "fern")]
    [InlineData(GroupTone.Teal, "teal")]
    [InlineData(GroupTone.Indigo, "indigo")]
    [InlineData(GroupTone.Iris, "iris")]
    [InlineData(GroupTone.Violet, "violet")]
    [InlineData(GroupTone.Orchid, "orchid")]
    [InlineData(GroupTone.Rose, "rose")]
    public void Should_CarryTheCamelCaseName_When_AGruppenfarbeGoesOnTheWire(
        GroupTone tone,
        string wireName
    ) => Assert.Equal($"\"{wireName}\"", JsonSerializer.Serialize(tone, ApiOptions));

    [Theory]
    [InlineData(DayOfWeek.Monday, "monday")]
    [InlineData(DayOfWeek.Tuesday, "tuesday")]
    [InlineData(DayOfWeek.Wednesday, "wednesday")]
    [InlineData(DayOfWeek.Thursday, "thursday")]
    [InlineData(DayOfWeek.Friday, "friday")]
    [InlineData(DayOfWeek.Saturday, "saturday")]
    [InlineData(DayOfWeek.Sunday, "sunday")]
    public void Should_CarryTheCamelCaseName_When_AWochentagGoesOnTheWire(
        DayOfWeek weekday,
        string wireName
    ) => Assert.Equal($"\"{wireName}\"", JsonSerializer.Serialize(weekday, ApiOptions));

    [Fact]
    public void Should_PinEveryValue_When_TheGruppenfarbenAreCounted() =>
        Assert.Equal(10, Enum.GetValues<GroupTone>().Length);
}
