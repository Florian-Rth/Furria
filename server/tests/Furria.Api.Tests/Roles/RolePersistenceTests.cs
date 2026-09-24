using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Roles;

[Collection("Api")]
public sealed class RolePersistenceTests
{
    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly HandedOver2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public RolePersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StoreItsPermissions_When_ARoleIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole(
                        "gruppenpflege",
                        "Gruppenpflege",
                        FurriaPermissions.GroupsManage,
                        FurriaPermissions.PersonsReadDetails
                    )
                ),
            ct
        );

        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToHaveName("Gruppenpflege")
            .Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToGrantExactly(FurriaPermissions.GroupsManage, FurriaPermissions.PersonsReadDetails)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepBothRoleHoldings_When_TheEarlierOneWasHandedOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("gruppenpflege", "Gruppenpflege")
                            .AddRoleHolding(
                                "ilka-first",
                                "gruppenpflege",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                            .AddRoleHolding("ilka-second", "gruppenpflege", "ilka", ArchivedIn2021)
                    ),
            ct
        );

        await ctx
            .Expected.RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-first"))
            .ToHavePeriod(HeldSince2017, HandedOver2020)
            .RoleHolding(ctx.Roles.RoleHoldings.IdOf("ilka-second"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectASecondOpenRoleHolding_When_OneIsAlreadyOpen()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder
                        .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                        .Roles(roles =>
                            roles
                                .AddRole("gruppenpflege", "Gruppenpflege")
                                .AddRoleHolding(
                                    "ilka-first",
                                    "gruppenpflege",
                                    "ilka",
                                    HeldSince2017
                                )
                                .AddRoleHolding(
                                    "ilka-second",
                                    "gruppenpflege",
                                    "ilka",
                                    ArchivedIn2021
                                )
                        ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_role_holding_role_id_person_id_open", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectASecondPermission_When_TheRoleAlreadyCarriesThatKey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole("gruppenpflege", "Gruppenpflege", FurriaPermissions.GroupsManage)
                ),
            ct
        );

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.AddRolePermissionDirectlyAsync(
                ctx.Roles.Roles.IdOf("gruppenpflege"),
                FurriaPermissions.GroupsManage,
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_role_permission_role_id_permission_key", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectAnRoleHolding_When_TheEndPrecedesTheStart()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder
                        .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                        .Roles(roles =>
                            roles
                                .AddRole("gruppenpflege", "Gruppenpflege")
                                .AddRoleHolding(
                                    "ilka-first",
                                    "gruppenpflege",
                                    "ilka",
                                    ArchivedIn2021,
                                    HandedOver2020
                                )
                        ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, violation.SqlState);
        Assert.Equal("ck_role_holding_period", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_RejectTheName_When_AnActiveRoleUsesItInAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;

        var rejection = await Assert.ThrowsAsync<DbUpdateException>(() =>
            _fixture.BuildAsync(
                builder =>
                    builder.Roles(roles =>
                        roles
                            .AddRole("gruppenpflege", "Gruppenpflege")
                            .AddRole("gruppenpflege-copy", "gruppenpflege")
                    ),
                ct
            )
        );

        var violation = Assert.IsType<PostgresException>(rejection.InnerException);
        Assert.Equal(PostgresErrorCodes.UniqueViolation, violation.SqlState);
        Assert.Equal("ix_role_name_active", violation.ConstraintName);
    }

    [Fact]
    public async Task Should_AcceptTheName_When_TheRoleThatUsedItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles
                        .AddRoleWithDetails(
                            "gruppenpflege-retired",
                            "Gruppenpflege",
                            "Die alte Rolle.",
                            ArchivedIn2021
                        )
                        .AddRole("gruppenpflege", "Gruppenpflege")
                ),
            ct
        );

        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege-retired"))
            .ToBeArchivedOn(ArchivedIn2021)
            .Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StampUpdatedAt_When_ARoleIsEdited()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole("gruppenpflege", "Gruppenpflege", FurriaPermissions.GroupsManage)
                ),
            ct
        );

        var createdAt = _fixture.TimeProvider.GetUtcNow();

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () =>
            {
                var editedAt = _fixture.TimeProvider.GetUtcNow();

                await _fixture.EditRoleNameDirectlyAsync(
                    ctx.Roles.Roles.IdOf("gruppenpflege"),
                    "Gruppenbetreuung",
                    ct
                );

                await ctx
                    .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
                    .ToHaveName("Gruppenbetreuung")
                    .Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
                    .ToHaveBeenCreatedAt(createdAt)
                    .Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
                    .ToHaveBeenTouchedAt(editedAt)
                    .AssertAsync(ct);
            }
        );
    }
}
