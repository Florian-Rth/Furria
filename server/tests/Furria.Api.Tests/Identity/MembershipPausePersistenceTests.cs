using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Identity;

public sealed class MembershipPausePersistenceTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public MembershipPausePersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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
