using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class GroupPersistenceTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GroupPersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RejectASecondOpenGroupMembership_When_OneIsAlreadyOpen()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder
                        .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                        .Groups(groups =>
                            groups
                                .AddGroup("tanzgarde", "Tanzgarde")
                                .AddGroupMembership(
                                    "paula-first",
                                    "tanzgarde",
                                    "paula",
                                    JoinedIn2017
                                )
                                .AddGroupMembership(
                                    "paula-second",
                                    "tanzgarde",
                                    "paula",
                                    ArchivedIn2021
                                )
                        ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_group_membership_group_id_person_id_open", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectAGroupMembership_When_TheEndPrecedesTheStart()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder
                        .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                        .Groups(groups =>
                            groups
                                .AddGroup("tanzgarde", "Tanzgarde")
                                .AddGroupMembership(
                                    "paula-first",
                                    "tanzgarde",
                                    "paula",
                                    ArchivedIn2021,
                                    LeftIn2020
                                )
                        ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_group_membership_period", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectASecondOpenGroupAdminTenure_When_OneIsAlreadyOpen()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder
                        .Identity(identity => identity.AddPerson("nadine", "Nadine", "Ohlert"))
                        .Groups(groups =>
                            groups
                                .AddGroup("kindergarde", "Kindergarde")
                                .AddGroupAdmin(
                                    "nadine-first",
                                    "kindergarde",
                                    "nadine",
                                    "Trainerin",
                                    JoinedIn2017
                                )
                                .AddGroupAdmin(
                                    "nadine-second",
                                    "kindergarde",
                                    "nadine",
                                    "Trainerin",
                                    ArchivedIn2021
                                )
                        ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_group_admin_group_id_person_id_open", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectTheName_When_AnActiveGroupUsesItInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("tanzgarde-copy", "tanzgarde")
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_group_name_active", violation.ConstraintName);
    }
}
