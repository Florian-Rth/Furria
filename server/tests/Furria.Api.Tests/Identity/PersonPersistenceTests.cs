using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class PersonPersistenceTests
{
    private readonly ApiTestFixture _fixture;

    public PersonPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RoundTripName_When_PersonIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("alice", "Alice", "Muster")),
            ct
        );

        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveName("Alice", "Muster")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HaveNoMembership_When_PersonIsSeededAlone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("alice")),
            ct
        );

        await ctx
            .Expected.MembershipOf(ctx.Identity.People.IdOf("alice"))
            .ToNotExist()
            .AssertAsync(ct);
    }
}
