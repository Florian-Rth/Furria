using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class AccountPersistenceTests
{
    private readonly ApiTestFixture _fixture;

    public AccountPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LinkAccountToItsPerson_When_AccountIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("alice"))
            .ToBeLinkedTo(ctx.Identity.People.IdOf("alice"))
            .Account(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveEmail(ctx.Identity.EmailOf("alice"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_BeEnabled_When_AccountIsSeededWithoutTheDisabledFlag()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("alice"))
            .ToBeDisabled(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_BeDisabled_When_AccountIsSeededAsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice", disabled: true)),
            ct
        );

        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("alice"))
            .ToBeDisabled(true)
            .AssertAsync(ct);
    }
}
