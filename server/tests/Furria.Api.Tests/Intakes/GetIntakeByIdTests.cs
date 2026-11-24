using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Core.Intakes;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;

namespace Furria.Api.Tests.Intakes;

public sealed class GetIntakeByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetIntakeByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowAGroupAdminOnlyWhomSheMatches_When_SheReviewsHerIntake()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                With(intakes => intakes.AddIntake("fresh", GuardTrainer, groupAliases: [Guard]))(
                    builder
                );
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("existing", "Magdalena", "Altmann")
                            .AddPersonContact("existing", email: "lena.neu@example.org")
                            .AddMembership("existing-membership", "existing")
                    )
                    .Groups(groups => groups.AddGroupMembership("existing-show", Show, "existing"));
            },
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        await _fixture
            .CreateClient()
            .POSTAsync<SubmitIntake, SubmitIntakeRequest, SubmitIntakeResponse>(
                IntakeSubmissions.Adult(ctx.Intakes.LinkTokens.IdOf("fresh"))
            );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (_, shown) = await client.GETAsync<
            GetIntakeById,
            GetIntakeByIdRequest,
            GetIntakeByIdResponse
        >(new() { IntakeId = intakeId });

        Assert.NotNull(shown.Review);
        var candidate = Assert.Single(shown.Review.Candidates);
        Assert.Equal(ctx.Identity.People.IdOf("existing"), candidate.PersonId);
        Assert.Equal(IntakeMatch.Email, candidate.Match);
        Assert.Null(candidate.BirthDate);
        Assert.Null(candidate.IsMember);
        Assert.Null(candidate.Groups);
        Assert.Null(candidate.HasAccount);
    }

    [Fact]
    public async Task Should_HideTheLink_When_AGroupAdminViewsAnIntakeSheDidNotStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("board", Manager, groupAliases: [Guard])),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (response, shown) = await client.GETAsync<
            GetIntakeById,
            GetIntakeByIdRequest,
            GetIntakeByIdResponse
        >(new() { IntakeId = ctx.Intakes.Intakes.IdOf("board") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(shown.Intake.CanManage);
        Assert.Null(shown.Token);
    }
}
