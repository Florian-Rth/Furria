using System.Text.Json;
using System.Text.Json.Serialization;
using Furria.Application.Management;
using Furria.Application.Start;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class StartWireNamesTests
{
    private static readonly JsonSerializerOptions ApiOptions = new()
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };

    [Theory]
    [InlineData(StartPanelKind.Calendar, "calendar")]
    [InlineData(StartPanelKind.Announcements, "announcements")]
    [InlineData(StartPanelKind.Mine, "mine")]
    [InlineData(StartPanelKind.Groups, "groups")]
    [InlineData(StartPanelKind.ToDos, "toDos")]
    public void Should_CarryTheCamelCaseName_When_APanelKindGoesOnTheWire(
        StartPanelKind kind,
        string wireName
    ) => Assert.Equal($"\"{wireName}\"", JsonSerializer.Serialize(kind, ApiOptions));

    [Theory]
    [InlineData(StartMineKind.NewRole, "newRole")]
    [InlineData(StartMineKind.NewBoardSeat, "newBoardSeat")]
    [InlineData(StartMineKind.NewGroupAdmin, "newGroupAdmin")]
    [InlineData(StartMineKind.NewGroupMembership, "newGroupMembership")]
    [InlineData(StartMineKind.NewKey, "newKey")]
    [InlineData(StartMineKind.ContactChangedByOther, "contactChangedByOther")]
    [InlineData(StartMineKind.MembershipEnding, "membershipEnding")]
    [InlineData(StartMineKind.MembershipPaused, "membershipPaused")]
    [InlineData(StartMineKind.Milestone, "milestone")]
    public void Should_CarryTheCamelCaseName_When_AnItemOfHersGoesOnTheWire(
        StartMineKind kind,
        string wireName
    ) => Assert.Equal($"\"{wireName}\"", JsonSerializer.Serialize(kind, ApiOptions));

    [Theory]
    [InlineData(StartGroupMomentKind.Jubilee, "jubilee")]
    public void Should_CarryTheCamelCaseName_When_AGroupMomentGoesOnTheWire(
        StartGroupMomentKind kind,
        string wireName
    ) => Assert.Equal($"\"{wireName}\"", JsonSerializer.Serialize(kind, ApiOptions));

    [Theory]
    [InlineData(ToDoKind.NeverInvited, "neverInvited")]
    [InlineData(ToDoKind.ReminderDue, "reminderDue")]
    [InlineData(ToDoKind.InPersonOnly, "inPersonOnly")]
    [InlineData(ToDoKind.BirthDateUnknown, "birthDateUnknown")]
    [InlineData(ToDoKind.KeyToTakeBack, "keyToTakeBack")]
    [InlineData(ToDoKind.ClubRecordGap, "clubRecordGap")]
    public void Should_CarryTheCamelCaseName_When_AToDoGoesOnTheWire(
        ToDoKind kind,
        string wireName
    ) => Assert.Equal($"\"{wireName}\"", JsonSerializer.Serialize(kind, ApiOptions));

    [Fact]
    public void Should_PinEveryValue_When_ThePanelKindsAreCounted() =>
        Assert.Equal(5, Enum.GetValues<StartPanelKind>().Length);

    [Fact]
    public void Should_PinEveryValue_When_TheKindsOfHerItemsAreCounted() =>
        Assert.Equal(9, Enum.GetValues<StartMineKind>().Length);

    [Fact]
    public void Should_PinEveryValue_When_TheToDoKindsAreCounted() =>
        Assert.Equal(6, Enum.GetValues<ToDoKind>().Length);
}
