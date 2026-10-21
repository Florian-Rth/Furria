using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Roles;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class GetRoles : EndpointWithoutRequest<GetRolesResponse>
{
    private readonly RoleService _roleService;

    public GetRoles(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Get("manage/roles");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var roles = await _roleService.GetRolesAsync(ct);

        await Send.OkAsync(ToResponse(roles), cancellation: ct);
    }

    private static GetRolesResponse ToResponse(IReadOnlyList<RoleSummary> roles) =>
        new() { Roles = [.. roles.Select(ToDto)], PermissionKeys = FurriaPermissions.All };

    private static RoleSummaryDto ToDto(RoleSummary role) =>
        new()
        {
            RoleId = role.RoleId,
            Name = role.Name,
            Description = role.Description,
            Coin = RoleCoinDto.From(role.Coin),
            ArchivedOn = role.ArchivedOn,
            PermissionKeys = role.PermissionKeys,
            Holders = [.. role.Holders.Select(ToDto)],
            ImpliedBy = [.. role.ImpliedBy.Select(RoleImpliedByOfficeDto.From)],
        };

    private static PersonRefDto ToDto(RoleHolderReference holder) =>
        new()
        {
            PersonId = holder.PersonId,
            FirstName = holder.FirstName,
            LastName = holder.LastName,
        };
}

public sealed record GetRolesResponse
{
    public required IReadOnlyList<RoleSummaryDto> Roles { get; init; }

    public required IReadOnlyList<string> PermissionKeys { get; init; }
}

public sealed record RoleSummaryDto
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required RoleCoinDto? Coin { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<string> PermissionKeys { get; init; }

    public required IReadOnlyList<PersonRefDto> Holders { get; init; }

    public required IReadOnlyList<RoleImpliedByOfficeDto> ImpliedBy { get; init; }
}

public sealed record RoleImpliedByOfficeDto
{
    public required int BoardOfficeId { get; init; }

    public required string Name { get; init; }

    public required int SeatedCount { get; init; }

    public static RoleImpliedByOfficeDto From(RoleImpliedByOffice office) =>
        new()
        {
            BoardOfficeId = office.BoardOfficeId,
            Name = office.Name,
            SeatedCount = office.SeatedCount,
        };
}

public sealed record PersonRefDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
