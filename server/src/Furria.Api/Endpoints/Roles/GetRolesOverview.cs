using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Roles;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class GetRolesOverview : EndpointWithoutRequest<GetRolesOverviewResponse>
{
    private readonly RoleService _roleService;

    public GetRolesOverview(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Get("roles");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var roles = await _roleService.GetRolesOverviewAsync(ct);

        await Send.OkAsync(ToResponse(roles), cancellation: ct);
    }

    private static GetRolesOverviewResponse ToResponse(IReadOnlyList<RoleOverviewSummary> roles) =>
        new() { Roles = [.. roles.Select(ToDto)] };

    private static RoleOverviewDto ToDto(RoleOverviewSummary role) =>
        new()
        {
            RoleId = role.RoleId,
            Name = role.Name,
            Description = role.Description,
            Holders = [.. role.Holders.Select(ToDto)],
        };

    private static RoleOverviewHolderDto ToDto(RoleOverviewHolder holder) =>
        new()
        {
            PersonId = holder.PersonId,
            FirstName = holder.FirstName,
            LastName = holder.LastName,
            SinceOn = holder.SinceOn,
        };
}

public sealed record GetRolesOverviewResponse
{
    public required IReadOnlyList<RoleOverviewDto> Roles { get; init; }
}

public sealed record RoleOverviewDto
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required IReadOnlyList<RoleOverviewHolderDto> Holders { get; init; }
}

public sealed record RoleOverviewHolderDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly SinceOn { get; init; }
}
