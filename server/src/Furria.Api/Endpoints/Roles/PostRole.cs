using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Roles;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class PostRole : Endpoint<PostRoleRequest, PostRoleResponse>
{
    private readonly RoleService _roleService;

    public PostRole(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Post("manage/roles");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(PostRoleRequest req, CancellationToken ct)
    {
        var result = await _roleService.CreateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static CreateRoleCommand ToCommand(PostRoleRequest req) =>
        new() { Name = req.Name, Description = req.Description };

    private static PostRoleResponse ToResponse(int roleId) => new() { RoleId = roleId };
}

public sealed record PostRoleRequest
{
    public required string Name { get; init; }

    public required string Description { get; init; }
}

public sealed class PostRoleValidator : Validator<PostRoleRequest>
{
    public PostRoleValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(RoleLimits.NameLength);
        RuleFor(request => request.Description)
            .NotNull()
            .MaximumLength(RoleLimits.DescriptionLength);
    }
}

public sealed record PostRoleResponse
{
    public required int RoleId { get; init; }
}
