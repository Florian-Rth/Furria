using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Honours;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Application.Roles;
using Furria.Infrastructure.Registry;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class GetRolesOverview : EndpointWithoutRequest<GetRolesOverviewResponse>
{
    private readonly RoleService _roleService;
    private readonly PersonHonoursQuery _honoursQuery;

    public GetRolesOverview(RoleService roleService, PersonHonoursQuery honoursQuery)
    {
        _roleService = roleService;
        _honoursQuery = honoursQuery;
    }

    public override void Configure()
    {
        Get("roles");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var roles = await _roleService.GetRolesOverviewAsync(ct);
        var honours = await _honoursQuery.OfAsync(
            roles.SelectMany(role => role.Holders).Select(holder => holder.PersonId),
            ct
        );

        await Send.OkAsync(ToResponse(roles, honours), cancellation: ct);
    }

    private static GetRolesOverviewResponse ToResponse(
        IReadOnlyList<RoleOverviewSummary> roles,
        PersonHonoursLookup honours
    ) => new() { Roles = [.. roles.Select(role => ToDto(role, honours))] };

    private static RoleOverviewDto ToDto(RoleOverviewSummary role, PersonHonoursLookup honours) =>
        new()
        {
            RoleId = role.RoleId,
            Name = role.Name,
            Description = role.Description,
            Coin = RoleCoinDto.From(role.Coin),
            Holders = [.. role.Holders.Select(holder => ToDto(holder, honours))],
        };

    private static RoleOverviewHolderDto ToDto(
        RoleOverviewHolder holder,
        PersonHonoursLookup honours
    ) =>
        new()
        {
            PersonId = holder.PersonId,
            FirstName = holder.FirstName,
            LastName = holder.LastName,
            SinceOn = holder.SinceOn,
            Honours = PersonHonoursDto.From(honours.Of(holder.PersonId)),
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

    public required RoleCoinDto? Coin { get; init; }

    public required IReadOnlyList<RoleOverviewHolderDto> Holders { get; init; }
}

public sealed record RoleOverviewHolderDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required PersonHonoursDto Honours { get; init; }
}
