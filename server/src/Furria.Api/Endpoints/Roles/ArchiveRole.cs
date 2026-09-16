using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class ArchiveRole : Endpoint<ArchiveRoleRequest>
{
    private readonly RoleService _roleService;

    public ArchiveRole(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Post("manage/roles/{roleId}/archive");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(ArchiveRoleRequest req, CancellationToken ct)
    {
        var result = await _roleService.ArchiveAsync(req.RoleId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record ArchiveRoleRequest
{
    [RouteParam]
    public required int RoleId { get; init; }
}

public sealed class ArchiveRoleValidator : Validator<ArchiveRoleRequest>
{
    public ArchiveRoleValidator()
    {
        RuleFor(request => request.RoleId).GreaterThan(0);
    }
}
