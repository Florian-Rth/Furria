using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class GetPersonAccessStateTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetPersonAccessStateTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_FlipToActive_When_SheRedeemsTheCodeWhileTheScreenPolls()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var issued = await InvitationSteps.InviteInPersonAsync(manager, annaId);
        var (_, before) = await ReadStateAsync(manager, annaId);

        await InvitationSteps.RedeemByCodeAsync(_fixture.CreateClient(), issued.Code);
        var (_, after) = await ReadStateAsync(manager, annaId);

        Assert.Equal(AccountAccessState.Invited, before.State);
        Assert.Equal(AccountAccessState.Active, after.State);
    }

    [Fact]
    public async Task Should_ReportNoAccess_When_TheInPersonCodeRanOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteInPersonAsync(manager, annaId);

        AccountAccessState? state = null;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(15),
            async () =>
            {
                var laterManager = await ctx.Identity.ManagingLoginClientAsync(ct);
                state = (await ReadStateAsync(laterManager, annaId)).Result.State;
            }
        );

        Assert.Equal(AccountAccessState.NoAccess, state);
    }

    [Fact]
    public async Task Should_ReportDisabled_When_HerAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            _fixture.Today
                        )
                        .AddAccount("anna", disabled: true)
                ),
            ct
        );
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await ReadStateAsync(manager, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(AccountAccessState.Disabled, result.State);
    }

    private static Task<TestResult<GetPersonAccessStateResponse>> ReadStateAsync(
        HttpClient client,
        int personId
    ) =>
        client.GETAsync<
            GetPersonAccessState,
            GetPersonAccessStateRequest,
            GetPersonAccessStateResponse
        >(new GetPersonAccessStateRequest { PersonId = personId });
}
