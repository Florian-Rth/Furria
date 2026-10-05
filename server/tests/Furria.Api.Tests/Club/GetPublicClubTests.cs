using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

[Collection("Api")]
public sealed class GetPublicClubTests
{
    private const string PublicClubRoute = "/api/public/club";
    private const string RecordedName = "Furrscher Carnevals Club e.V.";
    private const string RecordedMotto = "FURRIA — Der Mittelpunkt des Universums";

    private static readonly DateOnly JoinedIn2010 = new(2010, 1, 1);
    private static readonly DateOnly LeftIn2012 = new(2012, 1, 1);
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly JoinsInMarch2027 = new(2027, 3, 1);
    private static readonly DateOnly ArchivedIn2020 = new(2020, 1, 1);

    private static readonly DateTimeOffset AfterAshWednesday = new(
        2026,
        7,
        1,
        12,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset InsideTheSession = new(
        2027,
        1,
        15,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetPublicClubTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheRecordedNameAndFoundedYear_When_AnAnonymousCallerReadsTheClub()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder => builder.Club(club => club.SetClubRecord(RecordedName, foundedYear: 1971)),
            ct
        );

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicClub, GetPublicClubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(RecordedName, result.Name);
        Assert.Equal(1971, result.FoundedYear);
    }

    [Fact]
    public async Task Should_CarryHowToReachTheClub_When_TheClubHasRecordedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        RecordedName,
                        email: "vorstand@furria.de",
                        phone: "036334 12345",
                        instagramUrl: "https://instagram.com/furria",
                        facebookUrl: "https://facebook.com/furria"
                    )
                ),
            ct
        );

        var result = await ReadTheClubAsync();

        Assert.Equal("vorstand@furria.de", result.Email);
        Assert.Equal("036334 12345", result.Phone);
        Assert.Equal("https://instagram.com/furria", result.InstagramUrl);
        Assert.Equal("https://facebook.com/furria", result.FacebookUrl);
    }

    [Fact]
    public async Task Should_LeaveTheRecordedFactsEmpty_When_TheClubHasNoRecord()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var result = await ReadTheClubAsync();

        Assert.Null(result.Name);
        Assert.Null(result.FoundedYear);
        Assert.Null(result.Email);
        Assert.Null(result.Phone);
        Assert.Null(result.InstagramUrl);
        Assert.Null(result.FacebookUrl);
    }

    [Fact]
    public async Task Should_CountPeopleWithARunningMembershipPausedOrNot_When_TheClubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                await _fixture.BuildAsync(
                    builder =>
                        builder.Identity(identity =>
                            identity
                                .AddPerson("alice", "Alice", "Muster")
                                .AddMembership("alice-earlier", "alice", JoinedIn2010, LeftIn2012)
                                .AddMembership("alice-now", "alice", JoinedIn2017)
                                .AddPerson("paul", "Paul", "Pause")
                                .AddMembership("paul-now", "paul", JoinedIn2017)
                                .AddMembershipPause("paul-pause", "paul-now", 2026)
                                .AddPerson("chris", "Chris", "Ehemals")
                                .AddMembership("chris-past", "chris", JoinedIn2010, LeftIn2012)
                                .AddPerson("dora", "Dora", "Bald")
                                .AddMembership("dora-soon", "dora", JoinsInMarch2027)
                        ),
                    ct
                );

                var result = await ReadTheClubAsync();

                Assert.Equal(2, result.MemberCount);
            }
        );
    }

    [Fact]
    public async Task Should_CountOnlyGroupsThatAreNotArchived_When_TheClubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("tanzgarde", "Tanzgarde")
                        .AddGroup("elferrat", "Elferrat")
                        .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedIn2020)
                ),
            ct
        );

        var result = await ReadTheClubAsync();

        Assert.Equal(2, result.GroupCount);
    }

    [Fact]
    public async Task Should_AdvertiseTheComingSessionWithItsMotto_When_AshWednesdayHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            AfterAshWednesday,
            async () =>
            {
                await _fixture.BuildAsync(
                    builder =>
                        builder.Club(club =>
                            club.AddSession("laufende", 2025, motto: "Vorbei")
                                .AddSession("kommende", 2026, motto: RecordedMotto)
                        ),
                    ct
                );

                var result = await ReadTheClubAsync();

                Assert.Equal(2026, result.Session.StartYear);
                Assert.Equal("2026/27", result.Session.Label);
                Assert.Equal(RecordedMotto, result.Session.Motto);
            }
        );
    }

    [Fact]
    public async Task Should_NameTheSessionWithoutAMotto_When_TheClubHasNotRecordedOne()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InsideTheSession,
            async () =>
            {
                await _fixture.BuildAsync(ct);

                var result = await ReadTheClubAsync();

                Assert.Equal(2026, result.Session.StartYear);
                Assert.Equal("2026/27", result.Session.Label);
                Assert.Null(result.Session.Motto);
            }
        );
    }

    [Fact]
    public async Task Should_CarryExactlyTheContractFields_When_TheClubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        RecordedName,
                        foundedYear: 1971,
                        street: "Hauptstraße 1",
                        zip: "99706",
                        city: "Großfurra",
                        email: "vorstand@furria.de",
                        websiteUrl: "https://furria.de"
                    )
                ),
            ct
        );

        var payload = await _fixture.CreateClient().GetStringAsync(PublicClubRoute, ct);

        using var document = JsonDocument.Parse(payload);
        Assert.Equal(
            [
                "name",
                "foundedYear",
                "email",
                "phone",
                "instagramUrl",
                "facebookUrl",
                "memberCount",
                "groupCount",
                "session",
            ],
            document.RootElement.EnumerateObject().Select(field => field.Name)
        );
        Assert.Equal(
            ["startYear", "label", "motto"],
            document
                .RootElement.GetProperty("session")
                .EnumerateObject()
                .Select(field => field.Name)
        );
    }

    private async Task<GetPublicClubResponse> ReadTheClubAsync()
    {
        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicClub, GetPublicClubResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
