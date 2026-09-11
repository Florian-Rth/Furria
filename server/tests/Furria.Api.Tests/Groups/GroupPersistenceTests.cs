using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GroupPersistenceTests
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
    public async Task Should_StoreItsOpenness_When_AGruppeIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups.AddGroup(
                        "tanzgarde",
                        "Tanzgarde",
                        "Die Garde tanzt in der ganzen Session.",
                        isRecruiting: true
                    )
                ),
            ct
        );

        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveName("Tanzgarde")
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveDescription("Die Garde tanzt in der ganzen Session.")
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeRecruiting(true)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectASecondOpenZugehoerigkeit_When_OneIsAlreadyOpen()
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
    public async Task Should_KeepBothZugehoerigkeiten_When_TheEarlierOneEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
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
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership(
                                "paula-second",
                                "tanzgarde",
                                "paula",
                                ArchivedIn2021
                            )
                    ),
            ct
        );

        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-first"))
            .ToHavePeriod(JoinedIn2017, LeftIn2020)
            .GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-second"))
            .ToBeOpen()
            .GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveCount(2)
            .GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectAZugehoerigkeit_When_TheEndPrecedesTheStart()
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
    public async Task Should_RejectASecondOpenGruppenAdminschaft_When_OneIsAlreadyOpen()
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
    public async Task Should_RejectAGruppenAdminschaft_When_TheEndPrecedesTheStart()
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
                                    ArchivedIn2021,
                                    LeftIn2020
                                )
                        ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_group_admin_period", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectTheName_When_AnActiveGruppeUsesItInAnotherCase()
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

    [Fact]
    public async Task Should_AcceptTheName_When_TheGruppeThatUsedItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup(
                            "tanzgarde-retired",
                            "Tanzgarde",
                            "Die alte Garde.",
                            isRecruiting: false,
                            ArchivedIn2021
                        )
                        .AddGroup("tanzgarde", "Tanzgarde")
                ),
            ct
        );

        await ctx
            .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde-retired"))
            .ToBeArchivedOn(ArchivedIn2021)
            .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheFunktionAsALabel_When_AGruppenAdminIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("nadine", "Nadine", "Ohlert"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "nadine-kindergarde",
                                "kindergarde",
                                "nadine",
                                "Trainerin",
                                JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "nadine-tanzgarde",
                                "tanzgarde",
                                "nadine",
                                sinceOn: JoinedIn2017
                            )
                            .AddGroup("tanzgarde", "Tanzgarde")
                    ),
            ct
        );

        await ctx
            .Expected.GroupAdmin(ctx.Groups.GroupAdmins.IdOf("nadine-kindergarde"))
            .ToHaveFunction("Trainerin")
            .GroupAdmin(ctx.Groups.GroupAdmins.IdOf("nadine-kindergarde"))
            .ToHavePeriod(JoinedIn2017, null)
            .GroupAdmin(ctx.Groups.GroupAdmins.IdOf("nadine-tanzgarde"))
            .ToHaveFunction(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StampUpdatedAt_When_AGruppeIsEdited()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var createdAt = _fixture.TimeProvider.GetUtcNow();

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () =>
            {
                var editedAt = _fixture.TimeProvider.GetUtcNow();

                await _fixture.EditGroupNameDirectlyAsync(
                    ctx.Groups.Groups.IdOf("tanzgarde"),
                    "Grosse Tanzgarde",
                    ct
                );

                await ctx
                    .Expected.Group(ctx.Groups.Groups.IdOf("tanzgarde"))
                    .ToHaveName("Grosse Tanzgarde")
                    .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
                    .ToHaveBeenCreatedAt(createdAt)
                    .Group(ctx.Groups.Groups.IdOf("tanzgarde"))
                    .ToHaveBeenTouchedAt(editedAt)
                    .AssertAsync(ct);
            }
        );
    }
}
