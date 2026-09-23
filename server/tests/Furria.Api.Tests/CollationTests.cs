using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests;

[Collection("Api")]
public sealed class CollationTests
{
    private readonly ApiTestFixture _fixture;

    public CollationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SortUmlautsAsGerman_When_TheDatabaseOrdersGroupNames()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("tanzgarde", "Tanzgarde")
                        .AddGroup("marschmusik", "Marschmusik")
                        .AddGroup("aeltestenrat", "Ältestenrat")
                        .AddGroup("maennerballett", "Männerballett")
                ),
            ct
        );

        await ctx
            .Expected.Groups()
            .ToReadInGermanOrder("Ältestenrat", "Männerballett", "Marschmusik", "Tanzgarde")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectTheName_When_AnActiveGroupUsesItsUmlautInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Groups(groups =>
                        groups.AddGroup("aerzte", "Ärzte").AddGroup("aerzte-copy", "ärzte")
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_group_name_active", violation.ConstraintName);
    }
}
