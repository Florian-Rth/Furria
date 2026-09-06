using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class BootstrapAdminSeederTests
{
    private readonly ApiTestFixture _fixture;

    public BootstrapAdminSeederTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CreateTheAdminAndItsPerson_When_TheDatabaseHadNoAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await ctx
            .Expected.Account(_fixture.BootstrapAdmin.AccountId)
            .ToHaveEmail(ApiTestFixture.BootstrapAdminEmail)
            .Account(_fixture.BootstrapAdmin.AccountId)
            .ToBeLinkedTo(_fixture.BootstrapAdmin.PersonId)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HaveNoMembership_When_TheAdminIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await ctx
            .Expected.MembershipOf(_fixture.BootstrapAdmin.PersonId)
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateNoFurtherAccount_When_TheSeederRunsAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx.Expected.Accounts().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AcceptTheConfiguredCredentials_When_TheAdminLogsIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var session = await ctx.Identity.LogInAsync(
            ApiTestFixture.BootstrapAdminEmail,
            ApiTestFixture.BootstrapAdminPassword,
            ct
        );

        Assert.NotEmpty(session.AccessToken);
    }

    [Fact]
    public async Task Should_RestoreTheAdmin_When_TheDatabaseIsReset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        await _fixture.ResetDatabaseAsync(ct);

        await ctx
            .Expected.Accounts()
            .ToHaveCount(1)
            .Account(_fixture.BootstrapAdmin.AccountId)
            .ToExist()
            .AssertAsync(ct);
    }
}
