using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Xunit;

namespace Furria.Api.Tests.Roles;

public sealed class RolePersistenceTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public RolePersistenceTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
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
}
