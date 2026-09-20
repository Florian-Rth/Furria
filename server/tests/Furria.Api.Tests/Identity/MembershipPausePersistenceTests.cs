using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class MembershipPausePersistenceTests
{
    private readonly ApiTestFixture _fixture;

    public MembershipPausePersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StayOpenEnded_When_NoLastSessionIsRecorded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice")
                        .AddMembership("alice-first", "alice")
                        .AddMembershipPause(
                            "alice-ruhezeit",
                            "alice-first",
                            _fixture.CurrentSessionYear
                        )
                ),
            ct
        );

        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("alice-ruhezeit"))
            .ToHaveSpan(_fixture.CurrentSessionYear, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RoundTripTheSpan_When_TheRuhezeitCoversSeveralSessions()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice")
                        .AddMembership("alice-first", "alice")
                        .AddMembershipPause(
                            "alice-ruhezeit",
                            "alice-first",
                            _fixture.CurrentSessionYear - 2,
                            _fixture.CurrentSessionYear
                        )
                ),
            ct
        );

        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("alice-ruhezeit"))
            .ToHaveSpan(_fixture.CurrentSessionYear - 2, _fixture.CurrentSessionYear)
            .AssertAsync(ct);
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
                            .AddMembership("alice-first", "alice")
                            .AddMembershipPause(
                                "alice-ruhezeit",
                                "alice-first",
                                _fixture.CurrentSessionYear,
                                _fixture.CurrentSessionYear - 1
                            )
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_membership_pause_span", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectTheSession_When_ItPrecedesTheFoundingSession()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Identity(identity =>
                        identity
                            .AddPerson("alice")
                            .AddMembership("alice-first", "alice")
                            .AddMembershipPause(
                                "alice-ruhezeit",
                                "alice-first",
                                ClubSession.EarliestSessionYear - 1
                            )
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_membership_pause_founding", violation.ConstraintName);
    }
}
