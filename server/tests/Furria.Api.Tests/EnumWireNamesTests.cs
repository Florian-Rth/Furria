using System.Diagnostics.Contracts;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Changes;
using Furria.Application.Changes;
using Furria.Application.Identity;
using Furria.Application.Management;
using Furria.Application.Operations;
using Furria.Application.Registry;
using Furria.Application.Start;
using Furria.Core.BeerList;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Gallery;
using Furria.Core.Halls;
using Furria.Core.Identity;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Core.RunningOrders;
using Furria.Core.Studio;
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
        [typeof(StartPanelKind)] = "calendar announcements mine groups toDos gallery news beerTab",
        [typeof(StartMineKind)] =
            "newBoardSeat newGroupAdmin newGroupMembership newKey "
            + "contactChangedByOther membershipEnding membershipPaused milestone",
        [typeof(StartGroupMomentKind)] = "jubilee",
        [typeof(ToDoKind)] =
            "neverInvited reminderDue inPersonOnly birthDateUnknown keyToTakeBack "
            + "clubRecordGap applicationWaiting",
        [typeof(ClubIcon)] =
            "crown euro bolt shield camera sparkle mic musicNote drum mask megaphone star "
            + "trophy flag key shirt pen wrench palette heart mug calendar whistle broom scepter "
            + "jesterCap chain viceCrown childCrown laurel medal gavel briefcase quill ledger "
            + "jingleBell castle diamond handshake child confetti rocket",
        [typeof(PersonFunctionKind)] = "boardSeat groupAdmin role",
        [typeof(DayOfWeek)] = "sunday monday tuesday wednesday thursday friday saturday",
        [typeof(EventSalesStatus)] =
            "announced presaleScheduled available fewLeft soldOut cancelled",
        [typeof(EventStep)] = "details tickets runningOrder hall",
        [typeof(TableShape)] = "rectangle round",
        [typeof(SeatingMode)] = "comfortable maximum",
        [typeof(TableSide)] = "front back start end around",
        [typeof(HallElementKind)] = "wall door area pillar line text",
        [typeof(DoorKind)] = "entrance emergencyExit door",
        [typeof(HallAreaKind)] = "stage bar technics wardrobe toilets kitchen other",
        [typeof(HallAreaShape)] = "rect polygon",
        [typeof(HallTextSize)] = "small medium large",
        [typeof(EventStepState)] = "done overdue open waiting",
        [typeof(MissingEventDetail)] = "venue doorsOpenAt description picture published",
        [typeof(MediaItemState)] = "processing ready failed",
        [typeof(NewsCategory)] = "session achievements club groups",
        [typeof(NewsPostState)] = "draft published withdrawn",
        [typeof(NewsPublicationRequirement)] = "category title teaser text",
        [typeof(MediaKind)] = "photo video audio",
        [typeof(EveningChange)] = "cast spots choreography",
        [typeof(MediaOwnerKind)] =
            "person group gallery newsPost website event act session uploadLink",
        [typeof(UploadLinkState)] = "open expired revoked",
        [typeof(SystemLevel)] = "ok attention broken",
        [typeof(SystemCheck)] = "database workers queue storage media logs services mail",
        [typeof(SystemReasonCode)] =
            "databaseUnreachable pendingMigrations slowDatabase workerStale noLiveWorker "
            + "workerVersionMismatch queueWaiting diskLow storageUnmeasured mediaFailed "
            + "errorsLogged errorBurst serviceOverdue serviceFailed mailRetrying mailStuck",
        [typeof(BackgroundJob)] =
            "abandonedUploadSweep mediaFileReaper galleryBinPurge mailDispatcher "
            + "unconfirmedApplicationPurge signedOutMailRequestWorker "
            + "logEntryPurge mediaStorageSurvey actCastFreeze beerTabReminders beerStockWarnings "
            + "pushDispatcher",
        [typeof(LogSource)] = "api mediaWorker",
        [typeof(LogEntryLevel)] = "information warning error fatal",
        [typeof(ActKind)] = "dance speech music show point",
        [typeof(CalendarEntryAddOnKind)] =
            "attendance participatingGroups poll signUpList daySchedule",
        [typeof(RunningOrderRuleKind)] =
            "first last firstHalf secondHalf early late before after apart kindSpread",
        [typeof(RuleStrength)] = "must prefer",
        [typeof(FindingKind)] =
            "noChangeover tightChangeover mustRuleBroken preferRuleMissed sameKindAdjacent "
            + "nobodyThere absences unplaced",
        [typeof(FindingSeverity)] = "conflict hint",
        [typeof(RunningOrderCostStep)] =
            "noChangeover tightChangeover mustRules preferRules sameKind unplaced changeoverRoom",
        [typeof(RunningOrderHoldKind)] = "pin block mustRule mustWish",
        [typeof(StudioMusicSource)] = "workingMix finalTrack",
        [typeof(AnchorPlacement)] = "onTimeline cutAway musicMissing",
        [typeof(VideoPlacement)] = "onTimeline cutAway musicMissing unaligned",
        [typeof(KeyframeEasing)] = "linear easeIn easeOut easeInOut",
        [typeof(ChoreographyVersionKind)] = "saved restored spotRemoved musicAdopted",
        [typeof(BeerStockMovementKind)] = "delivery correction handoverCarry handedOver",
        [typeof(InvitationChannel)] = "mail inPerson request claimWindow",
        [typeof(AccountEventKind)] =
            "invited reminded redeemed recovered disabled enabled deleted loginEmailChanged "
            + "recoveryIssued claimed",
        [typeof(ClaimOutcome)] = "invited hasAccount hasEmail underAge notFound closed",
        [typeof(DomainChange)] =
            "person picture membership membershipApplication account group groupKind "
            + "groupMembership groupAdmin usualTrainingTime calendarEntry attendanceResponse "
            + "event role roleHolding boardOffice boardSeat sessionRecord venue keyHolding "
            + "clubRecord announcement announcementSeen media newsPost websitePicture act "
            + "actCoEditor actMusic actChoreography actSteps actVideos actEvening runningOrder "
            + "beerListEnrollment beerPot beerStock beerCrate beerPayment pushDevice hall "
            + "tablePlan seating claimWindow calendarPollVote calendarSignUpLine",
        [typeof(ChangeLineKind)] = "ready changes ping",
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
