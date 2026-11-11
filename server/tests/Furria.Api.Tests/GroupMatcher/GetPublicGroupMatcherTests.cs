using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.GroupMatcher;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.GroupMatcher;

public sealed class GetPublicGroupMatcherTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetPublicGroupMatcherTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ServeTheTakingPartGroupsWithStancesAndAges_When_TwoGroupsTakePart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroup("buettenrede", "Büttenrede")
                    )
                    .GroupMatcher(matcher =>
                        TwoTakingPart(matcher)
                            .AddAdmissionAge("elferrat", AdmissionAgeBand.EighteenPlus)
                            .AddStance("buettenrede", "konfetti", StancePosition.Neutral)
                    ),
            ct
        );

        var (response, result) = await GetAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(["Elferrat", "Tanzgarde"], result.Groups.Select(group => group.Name));
        var statement = Assert.Single(result.Statements);
        Assert.Equal(ctx.GroupMatcher.Statements.IdOf("konfetti"), statement.StatementId);
        Assert.Equal(
            [ctx.Groups.Groups.IdOf("tanzgarde"), ctx.Groups.Groups.IdOf("elferrat")],
            statement.Stances.Select(stance => stance.GroupId).Order()
        );
        Assert.Equal(
            [AdmissionAgeBand.EighteenPlus],
            result
                .AdmissionAges.Single(ages => ages.GroupId == ctx.Groups.Groups.IdOf("elferrat"))
                .Bands
        );
    }

    [Fact]
    public async Task Should_KeepAGroupIn_When_AStatementApprovedLaterIsStillUnanswered()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Groups(groups =>
                        groups.AddGroup("tanzgarde", "Tanzgarde").AddGroup("elferrat", "Elferrat")
                    )
                    .GroupMatcher(matcher =>
                        TwoTakingPart(matcher)
                            .AddStatement("bierbank", "Bierbänke stelle ich auf.")
                            .AddStance("elferrat", "bierbank", StancePosition.Yes)
                    ),
            ct
        );

        var (response, result) = await GetAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, result.Groups.Count);
        var later = result.Statements.Single(statement =>
            statement.StatementId == ctx.GroupMatcher.Statements.IdOf("bierbank")
        );
        Assert.Equal(ctx.Groups.Groups.IdOf("elferrat"), Assert.Single(later.Stances).GroupId);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_OneOfTwoTakingPartGroupsIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder =>
                builder
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat", archivedOn: ArchivedIn2021)
                    )
                    .GroupMatcher(matcher => TwoTakingPart(matcher)),
            ct
        );

        var (response, _) = await GetAsync();

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_NoStatementIsApproved()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder =>
                builder
                    .Groups(groups =>
                        groups.AddGroup("tanzgarde", "Tanzgarde").AddGroup("elferrat", "Elferrat")
                    )
                    .GroupMatcher(matcher =>
                        matcher
                            .AddProposal("vorschlag", "Wir tanzen rückwärts.", "tanzgarde")
                            .AddTakingPart("tanzgarde")
                            .AddTakingPart("elferrat")
                    ),
            ct
        );

        var (response, _) = await GetAsync();

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static GroupMatcherSeedBuilder TwoTakingPart(GroupMatcherSeedBuilder matcher) =>
        matcher
            .AddStatement("konfetti", "Konfetti ist Pflicht.")
            .AddStance("tanzgarde", "konfetti", StancePosition.Yes, 3)
            .AddStance("elferrat", "konfetti", StancePosition.No, 1)
            .AddTakingPart("tanzgarde")
            .AddTakingPart("elferrat");

    private Task<TestResult<GetPublicGroupMatcherResponse>> GetAsync() =>
        _fixture.CreateClient().GETAsync<GetPublicGroupMatcher, GetPublicGroupMatcherResponse>();
}
