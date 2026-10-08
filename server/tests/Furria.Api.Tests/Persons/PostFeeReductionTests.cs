using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PostFeeReductionTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const string ArchivedPersonMessage =
        "Paula ist archiviert – Beitragsermäßigungen lassen sich erst nach dem "
        + "Wiederherstellen festhalten.";
    private const int ReducedFrom2018 = 2018;
    private const int ReducedUntil2019 = 2019;
    private const int ReducedFrom2021 = 2021;
    private const int ReducedUntil2022 = 2022;
    private const int BeforeTheFounding = 1970;
    private const int UnknownPersonId = 987654;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostFeeReductionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecordTheReduction_When_AManagerGrantsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithPaulaAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostFeeReduction,
            PostFeeReductionRequest,
            PostFeeReductionResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                Basis = FeeReductionBasis.Studies,
                FirstSessionYear = ReducedFrom2018,
                LastSessionYear = ReducedUntil2019,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.FeeReduction(result.FeeReductionId)
            .ToHaveBasis(FeeReductionBasis.Studies)
            .FeeReduction(result.FeeReductionId)
            .ToHaveSpan(ReducedFrom2018, ReducedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseAndKeepHerArchived_When_SheIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                        .AddArchive("paula", ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostFeeReduction,
            PostFeeReductionRequest,
            PostFeeReductionResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                Basis = FeeReductionBasis.Studies,
                FirstSessionYear = ReducedFrom2018,
                LastSessionYear = ReducedUntil2019,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedPersonMessage], failures[ConflictField]);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(ArchivedIn2021, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordTheReduction_When_ThePersonIsNoMember()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostFeeReduction,
            PostFeeReductionRequest,
            PostFeeReductionResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                Basis = FeeReductionBasis.Minor,
                FirstSessionYear = ReducedFrom2018,
                LastSessionYear = ReducedUntil2019,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.FeeReduction(result.FeeReductionId)
            .ToHaveSpan(ReducedFrom2018, ReducedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordTheReduction_When_ItStartsInAComingSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithPaulaAsync(ct);

        var firstSessionYear = _fixture.CurrentSessionYear + 1;
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostFeeReduction,
            PostFeeReductionRequest,
            PostFeeReductionResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                Basis = FeeReductionBasis.Apprenticeship,
                FirstSessionYear = firstSessionYear,
                LastSessionYear = firstSessionYear + 2,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.FeeReduction(result.FeeReductionId)
            .ToHaveSpan(firstSessionYear, firstSessionYear + 2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordTheReduction_When_ItFollowsAnEarlierOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithSchoolReductionAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostFeeReduction,
            PostFeeReductionRequest,
            PostFeeReductionResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                Basis = FeeReductionBasis.Studies,
                FirstSessionYear = ReducedFrom2021,
                LastSessionYear = ReducedUntil2022,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.FeeReduction(result.FeeReductionId)
            .ToHaveBasis(FeeReductionBasis.Studies)
            .FeeReduction(result.FeeReductionId)
            .ToHaveSpan(ReducedFrom2021, ReducedUntil2022)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_TheLastSessionPrecedesTheFirst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithPaulaAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostFeeReduction,
            PostFeeReductionRequest,
            PostFeeReductionResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                Basis = FeeReductionBasis.School,
                FirstSessionYear = ReducedUntil2019,
                LastSessionYear = ReducedFrom2018,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Eine Beitragsermäßigung kann nicht vor ihrer ersten Session enden."],
            failures[ValidationField]
        );
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheSpanOverlapsAnotherReduction()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithSchoolReductionAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostFeeReduction,
            PostFeeReductionRequest,
            PostFeeReductionResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                Basis = FeeReductionBasis.Studies,
                FirstSessionYear = ReducedUntil2019,
                LastSessionYear = ReducedUntil2022,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Dieser Zeitraum überschneidet sich mit einer bestehenden Beitragsermäßigung."],
            failures[ConflictField]
        );
        await ctx
            .Expected.FeeReduction(ctx.Identity.FeeReductions.IdOf("paula-schule"))
            .ToHaveBasis(FeeReductionBasis.School)
            .FeeReduction(ctx.Identity.FeeReductions.IdOf("paula-schule"))
            .ToHaveSpan(ReducedFrom2018, ReducedUntil2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithPaulaAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostFeeReduction,
            PostFeeReductionRequest,
            PostFeeReductionResponse
        >(
            new()
            {
                PersonId = UnknownPersonId,
                Basis = FeeReductionBasis.Minor,
                FirstSessionYear = ReducedFrom2018,
                LastSessionYear = ReducedUntil2019,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheFirstSessionPredatesTheFounding()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithPaulaAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostFeeReduction,
            PostFeeReductionRequest,
            PostFeeReductionResponse
        >(
            new()
            {
                PersonId = ctx.Identity.People.IdOf("paula"),
                Basis = FeeReductionBasis.Minor,
                FirstSessionYear = BeforeTheFounding,
                LastSessionYear = ReducedUntil2019,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private Task<SeededContext> BuildWithPaulaAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                ),
            ct
        );

    private Task<SeededContext> BuildWithSchoolReductionAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017)
                        .AddFeeReduction(
                            "paula-schule",
                            "paula",
                            FeeReductionBasis.School,
                            ReducedFrom2018,
                            ReducedUntil2019
                        )
                ),
            ct
        );

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
