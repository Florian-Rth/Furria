using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Roles;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class PutRole : Endpoint<PutRoleRequest>
{
    private readonly RoleService _roleService;

    public PutRole(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Put("manage/roles/{roleId}");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(PutRoleRequest req, CancellationToken ct)
    {
        var result = await _roleService.UpdateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateRoleCommand ToCommand(PutRoleRequest req) =>
        new()
        {
            RoleId = req.RoleId,
            Name = req.Name,
            Description = req.Description,
        };
}

public sealed record PutRoleRequest
{
    [RouteParam]
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }
}

public sealed class PutRoleValidator : Validator<PutRoleRequest>
{
    public PutRoleValidator()
    {
        RuleFor(request => request.RoleId).GreaterThan(0);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(RoleLimits.NameLength);
        RuleFor(request => request.Description)
            .NotNull()
            .MaximumLength(RoleLimits.DescriptionLength);
    }
}
