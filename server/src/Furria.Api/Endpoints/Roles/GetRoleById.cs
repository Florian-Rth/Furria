using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Honours;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Application.Roles;
using Furria.Infrastructure.Registry;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class GetRoleById : Endpoint<GetRoleByIdRequest, GetRoleByIdResponse>
{
    private readonly RoleService _roleService;
    private readonly PersonHonoursQuery _honoursQuery;

    public GetRoleById(RoleService roleService, PersonHonoursQuery honoursQuery)
    {
        _roleService = roleService;
        _honoursQuery = honoursQuery;
    }

    public override void Configure()
    {
        Get("manage/roles/{roleId}");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(GetRoleByIdRequest req, CancellationToken ct)
    {
        var result = await _roleService.GetRoleAsync(req.RoleId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        var honours = await _honoursQuery.OfAsync(
            result.Value.Holders.Concat(result.Value.PastHolders).Select(holder => holder.PersonId),
            ct
        );

        await Send.OkAsync(ToResponse(result.Value, honours), cancellation: ct);
    }

    private static GetRoleByIdResponse ToResponse(RoleDetails role, PersonHonoursLookup honours) =>
        new()
        {
            RoleId = role.RoleId,
            Name = role.Name,
            Description = role.Description,
            Coin = RoleCoinDto.From(role.Coin),
            ArchivedOn = role.ArchivedOn,
            PermissionKeys = role.PermissionKeys,
            Holders = [.. role.Holders.Select(holder => ToDto(holder, honours))],
            PastHolders = [.. role.PastHolders.Select(holder => ToDto(holder, honours))],
        };

    private static RoleHolderDto ToDto(RoleHolder holder, PersonHonoursLookup honours) =>
        new()
        {
            RoleHoldingId = holder.RoleHoldingId,
            PersonId = holder.PersonId,
            FirstName = holder.FirstName,
            LastName = holder.LastName,
            SinceOn = holder.SinceOn,
            UntilOn = holder.UntilOn,
            Since = holder.Since,
            IsAffiliated = holder.IsAffiliated,
            Honours = PersonHonoursDto.From(honours.Of(holder.PersonId)),
        };
}

public sealed record GetRoleByIdRequest
{
    [RouteParam]
    public required int RoleId { get; init; }
}

public sealed class GetRoleByIdValidator : Validator<GetRoleByIdRequest>
{
    public GetRoleByIdValidator()
    {
        RuleFor(request => request.RoleId).GreaterThan(0);
    }
}

public sealed record GetRoleByIdResponse
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required RoleCoinDto? Coin { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<string> PermissionKeys { get; init; }

    public required IReadOnlyList<RoleHolderDto> Holders { get; init; }

    public required IReadOnlyList<RoleHolderDto> PastHolders { get; init; }
}

public sealed record RoleHolderDto
{
    public required int RoleHoldingId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }

    public required DateOnly Since { get; init; }

    public required bool IsAffiliated { get; init; }

    public required PersonHonoursDto Honours { get; init; }
}
