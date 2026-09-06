using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class MembershipPersistenceTests
{
    private readonly ApiTestFixture _fixture;

    public MembershipPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTypeAndStatusIndependent_When_AnAktivMembershipRuht()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice")
                        .AddMembership("alice", MembershipType.Active, MembershipStatus.Paused)
                ),
            ct
        );

        await ctx
            .Expected.MembershipOf(ctx.Identity.People.IdOf("alice"))
            .ToHave(MembershipType.Active, MembershipStatus.Paused)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_PersistHonoraryType_When_MembershipIsConferred()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("alice").AddMembership("alice", MembershipType.Honorary)
                ),
            ct
        );

        await ctx
            .Expected.MembershipOf(ctx.Identity.People.IdOf("alice"))
            .ToHave(MembershipType.Honorary, MembershipStatus.Active)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_PersistBothPeriodEnds_When_MembershipHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var startedAt = new DateOnly(2019, 11, 11);
        var endedAt = new DateOnly(2024, 2, 14);

        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice")
                        .AddMembership(
                            "alice",
                            MembershipType.Youth,
                            MembershipStatus.Left,
                            startedAt,
                            endedAt
                        )
                ),
            ct
        );

        await ctx
            .Expected.MembershipOf(ctx.Identity.People.IdOf("alice"))
            .ToHavePeriod(startedAt, endedAt)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectASecondMembership_When_ThePersonAlreadyHasOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("alice").AddMembership("alice")),
            ct
        );

        var rejection = await Assert.ThrowsAsync<PostgresException>(() =>
            _fixture.InsertMembershipDirectlyAsync(ctx.Identity.People.IdOf("alice"), ct)
        );

        Assert.Equal(PostgresErrorCodes.UniqueViolation, rejection.SqlState);
        Assert.Equal("ix_membership_person_id", rejection.ConstraintName);
    }
}
