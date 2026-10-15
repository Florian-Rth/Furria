using System.Diagnostics.Contracts;
using System.Text.Json;
using FastEndpoints;
using Furria.Application.Management;
using Furria.Application.Operations;
using Furria.Application.Registry;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Groups;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

public sealed class EnumWireNamesTests : IClassFixture<ApiTestFixture>
{
    private static readonly IReadOnlyDictionary<Type, string> NamesTheClientsParse = new Dictionary<
        Type,
        string
    >
    {
        [typeof(StartPanelKind)] = "calendar announcements mine groups toDos gallery",
        [typeof(StartMineKind)] =
            "newRole newBoardSeat newGroupAdmin newGroupMembership newKey "
            + "contactChangedByOther membershipEnding membershipPaused milestone",
        [typeof(StartGroupMomentKind)] = "jubilee",
        [typeof(ToDoKind)] =
            "neverInvited reminderDue inPersonOnly birthDateUnknown keyToTakeBack "
            + "clubRecordGap applicationWaiting ticketRequestWaiting",
        [typeof(GroupTone)] = "clay olive lime fern teal indigo iris violet orchid rose",
        [typeof(ClubIcon)] =
            "crown euro bolt shield camera sparkle mic musicNote drum mask megaphone star "
            + "trophy flag key shirt pen wrench palette heart mug calendar whistle broom",
        [typeof(PersonFunctionKind)] = "boardSeat groupAdmin role",
        [typeof(DayOfWeek)] = "sunday monday tuesday wednesday thursday friday saturday",
        [typeof(TrainingPreviewState)] = "creatable venueTaken alreadyExists venueArchived",
        [typeof(EventSalesStatus)] =
            "announced presaleScheduled available fewLeft soldOut cancelled",
        [typeof(MediaItemState)] = "processing ready failed",
        [typeof(NewsCategory)] = "session achievements club groups",
        [typeof(NewsPostState)] = "draft published withdrawn",
        [typeof(NewsPublicationRequirement)] = "category title teaser text",
        [typeof(MediaKind)] = "photo video",
        [typeof(MediaOwnerKind)] = "person group gallery newsPost website event",
        [typeof(SystemLevel)] = "ok attention broken",
        [typeof(SystemCheck)] = "database workers queue storage media logs services mail",
        [typeof(SystemReasonCode)] =
            "databaseUnreachable pendingMigrations slowDatabase workerStale noLiveWorker "
            + "workerVersionMismatch queueWaiting diskLow storageUnmeasured mediaFailed "
            + "errorsLogged errorBurst serviceOverdue serviceFailed mailRetrying mailStuck",
        [typeof(BackgroundJob)] =
            "abandonedUploadSweep mediaFileReaper galleryBinPurge mailDispatcher "
            + "unconfirmedApplicationPurge pastTicketRequestPurge signedOutMailRequestWorker "
            + "logEntryPurge mediaStorageSurvey",
        [typeof(LogSource)] = "api mediaWorker",
        [typeof(LogEntryLevel)] = "information warning error fatal",
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
