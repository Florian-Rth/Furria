using System.Diagnostics.Contracts;
using System.Text.Json;
using FastEndpoints;
using Furria.Application.Management;
using Furria.Application.Start;
using Furria.Core.Events;
using Furria.Core.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

[Collection("Api")]
public sealed class EnumWireNamesTests
{
    private static readonly IReadOnlyDictionary<Type, string> NamesTheClientsParse = new Dictionary<
        Type,
        string
    >
    {
        [typeof(StartPanelKind)] = "calendar announcements mine groups toDos",
        [typeof(StartMineKind)] =
            "newRole newBoardSeat newGroupAdmin newGroupMembership newKey "
            + "contactChangedByOther membershipEnding membershipPaused milestone",
        [typeof(StartGroupMomentKind)] = "jubilee",
        [typeof(ToDoKind)] =
            "neverInvited reminderDue inPersonOnly birthDateUnknown keyToTakeBack "
            + "clubRecordGap applicationWaiting ticketRequestWaiting",
        [typeof(GroupTone)] = "clay olive lime fern teal indigo iris violet orchid rose",
        [typeof(DayOfWeek)] = "sunday monday tuesday wednesday thursday friday saturday",
        [typeof(TrainingPreviewState)] = "creatable venueTaken alreadyExists venueArchived",
        [typeof(EventSalesStatus)] =
            "announced presaleScheduled available fewLeft soldOut cancelled",
    };

    private readonly ApiTestFixture _fixture;

    public EnumWireNamesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void Should_SpellEveryValueAsTheClientsParseIt_When_AnEnumGoesOnTheWire()
    {
        var hostOptions = HostSerializerOptions();

        var drifted = NamesTheClientsParse
            .Where(pinned => WireNamesOf(pinned.Key, hostOptions) != pinned.Value)
            .Select(pinned => $"{pinned.Key.Name}: {WireNamesOf(pinned.Key, hostOptions)}");

        Assert.Empty(drifted);
    }

    private JsonSerializerOptions HostSerializerOptions()
    {
        _ = _fixture.Services;
        return new Config().Serializer.Options;
    }

    [Pure]
    private static string WireNamesOf(Type enumType, JsonSerializerOptions options) =>
        string.Join(
            ' ',
            Enum.GetValues(enumType)
                .Cast<object>()
                .Select(value => JsonSerializer.Serialize(value, enumType, options).Trim('"'))
        );
}
