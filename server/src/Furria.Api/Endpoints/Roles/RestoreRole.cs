using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class RestoreRole : Endpoint<RestoreRoleRequest>
{
    private readonly RoleService _roleService;

    public RestoreRole(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Post("manage/roles/{roleId}/restore");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(RestoreRoleRequest req, CancellationToken ct)
    {
        var result = await _roleService.RestoreAsync(req.RoleId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record RestoreRoleRequest
{
    [RouteParam]
    public required int RoleId { get; init; }
}

public sealed class RestoreRoleValidator : Validator<RestoreRoleRequest>
{
    public RestoreRoleValidator()
    {
        RuleFor(request => request.RoleId).GreaterThan(0);
    }
}
