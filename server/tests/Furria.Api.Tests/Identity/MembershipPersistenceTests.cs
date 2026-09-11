using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class MembershipPersistenceTests
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public MembershipPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PersistBothPeriodEnds_When_TheMitgliedschaftHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017, LeftIn2020)
                ),
            ct
        );

        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("alice-first"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AcceptASecondMembership_When_TheFirstOneEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017, LeftIn2020)
                        .AddMembership("alice-second", "alice", RejoinedIn2021)
                ),
            ct
        );

        await ctx
            .Expected.MembershipsOfPerson(ctx.Identity.People.IdOf("alice"))
            .ToHaveCount(2)
            .MembershipsOfPerson(ctx.Identity.People.IdOf("alice"))
            .ToHaveOpenCount(1)
            .Membership(ctx.Identity.Memberships.IdOf("alice-second"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectASecondOpenMembership_When_OneIsAlreadyOpen()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Identity(identity =>
                        identity
                            .AddPerson("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                            .AddMembership("alice-second", "alice", RejoinedIn2021)
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_membership_person_id_open", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectAPeriod_When_TheEndPrecedesTheStart()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Identity(identity =>
                        identity
                            .AddPerson("alice")
                            .AddMembership("alice-first", "alice", RejoinedIn2021, LeftIn2020)
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_membership_period", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_AcceptASingleDayPeriod_When_TheStartAndTheEndAreTheSameDay()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017, JoinedIn2017)
                ),
            ct
        );

        await ctx
            .Expected.Membership(ctx.Identity.Memberships.IdOf("alice-first"))
            .ToHavePeriod(JoinedIn2017, JoinedIn2017)
            .AssertAsync(ct);
    }
}
