using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class FeeReductionPersistenceTests
{
    private readonly ApiTestFixture _fixture;

    public FeeReductionPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RoundTripBasisAndSpan_When_AFeeReductionIsRecorded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice")
                        .AddFeeReduction(
                            "alice-studium",
                            "alice",
                            FeeReductionBasis.Studies,
                            _fixture.CurrentSessionYear,
                            _fixture.CurrentSessionYear + 2
                        )
                ),
            ct
        );

        await ctx
            .Expected.FeeReduction(ctx.Identity.FeeReductions.IdOf("alice-studium"))
            .ToHaveBasis(FeeReductionBasis.Studies)
            .FeeReduction(ctx.Identity.FeeReductions.IdOf("alice-studium"))
            .ToHaveSpan(_fixture.CurrentSessionYear, _fixture.CurrentSessionYear + 2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectTheBasis_When_ItNamesNoKnownBasis()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Identity(identity =>
                        identity
                            .AddPerson("alice")
                            .AddFeeReduction(
                                "alice-unbekannt",
                                "alice",
                                (FeeReductionBasis)99,
                                _fixture.CurrentSessionYear,
                                _fixture.CurrentSessionYear
                            )
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_fee_reduction_basis", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectTheSpan_When_TheLastSessionPrecedesTheFirst()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Identity(identity =>
                        identity
                            .AddPerson("alice")
                            .AddFeeReduction(
                                "alice-schule",
                                "alice",
                                FeeReductionBasis.School,
                                _fixture.CurrentSessionYear,
                                _fixture.CurrentSessionYear - 1
                            )
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_fee_reduction_span", violation.ConstraintName);
    }
}
