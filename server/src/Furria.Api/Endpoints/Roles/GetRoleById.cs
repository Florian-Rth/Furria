using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Roles;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class GetRoleById : Endpoint<GetRoleByIdRequest, GetRoleByIdResponse>
{
    private readonly RoleService _roleService;

    public GetRoleById(RoleService roleService)
    {
        _roleService = roleService;
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

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static GetRoleByIdResponse ToResponse(RoleDetails role) =>
        new()
        {
            RoleId = role.RoleId,
            Name = role.Name,
            Description = role.Description,
            ArchivedOn = role.ArchivedOn,
            PermissionKeys = role.PermissionKeys,
            Holders = [.. role.Holders.Select(ToDto)],
            PastHolders = [.. role.PastHolders.Select(ToDto)],
        };

    private static RoleHolderDto ToDto(RoleHolder holder) =>
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
}
