using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GroupKindPersistenceTests
{
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GroupKindPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RejectTheName_When_ARunningGroupKindUsesItInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Groups(groups =>
                        groups.AddGroupKind("garde", "Garde").AddGroupKind("copy", "garde")
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_group_kind_name_active", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_AcceptTheName_When_TheGroupKindThatUsedItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("alter-zug", "Spielmannszug", ArchivedIn2021)
                        .AddGroupKind("neuer-zug", "Spielmannszug")
                ),
            ct
        );

        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("alter-zug"))
            .ToBeArchivedOn(ArchivedIn2021)
            .GroupKind(ctx.Groups.GroupKinds.IdOf("neuer-zug"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TieTheGroupToItsKind_When_TheSeedNamesOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("garde", "Garde")
                        .AddGroup("tanzgarde", "Tanzgarde", groupKindAlias: "garde")
                        .AddGroup("elferrat", "Elferrat")
                ),
            ct
        );

        await ctx
            .Expected.GroupKinds()
            .ToCountGroupsOf(ctx.Groups.GroupKinds.IdOf("garde"), 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SortUmlautsAsGerman_When_TheGroupKindsAreRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("zug", "Zug")
                        .AddGroupKind("aeltestenrat", "Ältestenrat")
                        .AddGroupKind("garde", "Garde")
                ),
            ct
        );

        await ctx
            .Expected.GroupKinds()
            .ToReadInNameOrder("Ältestenrat", "Garde", "Zug")
            .AssertAsync(ct);
    }
}
