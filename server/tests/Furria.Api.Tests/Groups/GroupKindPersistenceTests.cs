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
    public async Task Should_StoreItsPlaceInTheBand_When_AGruppenartIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroupKind("garde", "Garde", 2)),
            ct
        );

        await ctx
            .Expected.GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToHaveName("Garde")
            .GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToHaveSortOrder(2)
            .GroupKind(ctx.Groups.GroupKinds.IdOf("garde"))
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectTheName_When_ARunningGruppenartUsesItInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Groups(groups =>
                        groups.AddGroupKind("garde", "Garde", 1).AddGroupKind("copy", "garde", 2)
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_group_kind_name_active", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_AcceptTheName_When_TheGruppenartThatUsedItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("alter-zug", "Spielmannszug", 2, ArchivedIn2021)
                        .AddGroupKind("neuer-zug", "Spielmannszug", 3)
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
    public async Task Should_TieTheGruppeToItsArt_When_TheSeedNamesOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("garde", "Garde", 1)
                        .AddGroup("tanzgarde", "Tanzgarde", groupKindAlias: "garde")
                        .AddGroup("elferrat", "Elferrat")
                ),
            ct
        );

        await ctx
            .Expected.GroupKinds()
            .ToCountGruppenOf(ctx.Groups.GroupKinds.IdOf("garde"), 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SortUmlautsAsGerman_When_TheBandSharesOnePlace()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroupKind("zug", "Zug", 1)
                        .AddGroupKind("aeltestenrat", "Ältestenrat", 1)
                        .AddGroupKind("garde", "Garde", 1)
                ),
            ct
        );

        await ctx
            .Expected.GroupKinds()
            .ToReadInBandOrder("Ältestenrat", "Garde", "Zug")
            .AssertAsync(ct);
    }
}
