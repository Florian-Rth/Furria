using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Identity;

public sealed class PersonPersistenceTests : IClassFixture<ApiTestFixture>
{
    private const string PersonTable = "person";
    private const string MembershipPauseTable = "membership_pause";
    private const string CascadeRule = "CASCADE";
    private const string SetNullRule = "SET NULL";

    private readonly ApiTestFixture _fixture;

    public PersonPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () =>
            {
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
        );
    }

    [Fact]
    public async Task Should_LetEveryReferenceReachingAPersonCascadeOrGoNull_When_TheSchemaIsMigrated()
    {
        var ct = TestContext.Current.CancellationToken;
        var foreignKeys = await _fixture.ForeignKeysAsync(ct);

        var erasedWithHer = TablesErasedWith(PersonTable, foreignKeys);

        Assert.Contains(MembershipPauseTable, erasedWithHer);
        Assert.Empty(
            foreignKeys
                .Where(key => erasedWithHer.Contains(key.ReferencedTable))
                .Where(key => key.OnDelete is not (CascadeRule or SetNullRule))
                .Select(key => key.Name)
        );
    }

    private static HashSet<string> TablesErasedWith(
        string table,
        IReadOnlyList<SchemaForeignKey> foreignKeys
    )
    {
        var erased = new HashSet<string>(StringComparer.Ordinal) { table };
        bool grew;
        do
        {
            grew = false;
            foreach (
                var key in foreignKeys.Where(key =>
                    key.OnDelete == CascadeRule && erased.Contains(key.ReferencedTable)
                )
            )
                grew |= erased.Add(key.Table);
        } while (grew);

        return erased;
    }
}
