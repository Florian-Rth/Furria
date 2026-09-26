using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class GetPersonAccessStateTests
{
    private const int UnknownPersonId = 999_999;

    private readonly ApiTestFixture _fixture;

    public GetPersonAccessStateTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReportNoAccess_When_SheWasNeverInvited()
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, result) = await ReadStateAsync(manager, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(AccountAccessState.NoAccess, result.State);
    }

    [Fact]
    public async Task Should_ReportInvited_When_TheInPersonCodeIsShowing()
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteInPersonAsync(manager, annaId);

        var (_, result) = await ReadStateAsync(manager, annaId);

        Assert.Equal(AccountAccessState.Invited, result.State);
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteInPersonAsync(manager, annaId);

        AccountAccessState? state = null;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(15),
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (_, result) = await ReadStateAsync(manager, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(AccountAccessState.Disabled, result.State);
    }

    [Fact]
    public async Task Should_AnswerWithTheStateAndTheOpenRecoveryAlone_When_ThePayloadIsReadRaw()
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteInPersonAsync(manager, annaId);

        var (response, _) = await ReadStateAsync(manager, annaId);

        Assert.Equal(
            """{"state":"invited","isRecoveryOpen":false}""",
            await response.Content.ReadAsStringAsync(ct)
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddEligiblePerson(
                                "anna",
                                "Anna",
                                InvitationSteps.UniqueContactEmail("anna"),
                                _fixture.Today
                            )
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var (response, _) = await ReadStateAsync(client, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, _) = await ReadStateAsync(manager, UnknownPersonId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportTheOpenRecovery_When_TheRecoveryScreenPolls()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (_, before) = await ReadStateAsync(manager, annaId);

        var issued = await InvitationSteps.IssueRecoveryAsync(manager, annaId);
        var (_, open) = await ReadStateAsync(manager, annaId);
        await InvitationSteps.RedeemByCodeAsync(_fixture.CreateClient(), issued.Code);
        var (_, recovered) = await ReadStateAsync(manager, annaId);

        Assert.False(before.IsRecoveryOpen);
        Assert.True(open.IsRecoveryOpen);
        Assert.Equal(AccountAccessState.Active, open.State);
        Assert.False(recovered.IsRecoveryOpen);
        Assert.Equal(AccountAccessState.Active, recovered.State);
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
