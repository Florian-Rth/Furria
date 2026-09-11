using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class PersonPersistenceTests
{
    private static readonly DateOnly BirthDate = new(1996, 4, 3);

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
            .Expected.MembershipsOfPerson(ctx.Identity.People.IdOf("alice"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HideTheContactData_When_ThePersonHasNotOptedIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("alice")),
            ct
        );

        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveContactVisible(false)
            .Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveBirthDate(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RoundTripTheContactData_When_ThePersonOptedIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddPersonContact(
                            "alice",
                            phone: "0171 1234567",
                            street: "Marktplatz 1",
                            zip: "04680",
                            city: "Colditz",
                            contactVisibleToMembers: true,
                            birthDate: BirthDate
                        )
                ),
            ct
        );

        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveContactVisible(true)
            .Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveBirthDate(BirthDate)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StampBothTimestamps_When_APersonIsCreated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("alice")),
            ct
        );

        var createdAt = _fixture.TimeProvider.GetUtcNow();

        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveBeenCreatedAt(createdAt)
            .Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveBeenTouchedAt(createdAt)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StampUpdatedAt_When_APersonIsEdited()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("alice", "Alice", "Muster")),
            ct
        );

        var createdAt = _fixture.TimeProvider.GetUtcNow();
        _fixture.TimeProvider.Advance(TimeSpan.FromMinutes(1));
        var editedAt = _fixture.TimeProvider.GetUtcNow();

        await _fixture.EditPersonNameDirectlyAsync(
            ctx.Identity.People.IdOf("alice"),
            "Alice",
            "Kaiser",
            ct
        );

        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveName("Alice", "Kaiser")
            .Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveBeenCreatedAt(createdAt)
            .Person(ctx.Identity.People.IdOf("alice"))
            .ToHaveBeenTouchedAt(editedAt)
            .AssertAsync(ct);
    }
}
