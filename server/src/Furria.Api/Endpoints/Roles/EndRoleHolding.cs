using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Roles;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class EndRoleHolding : Endpoint<EndRoleHoldingRequest>
{
    private readonly RoleService _roleService;

    public EndRoleHolding(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Post("manage/roles/{roleId}/holdings/{roleHoldingId}/end");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(EndRoleHoldingRequest req, CancellationToken ct)
    {
        var result = await _roleService.EndHoldingAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static EndRoleHoldingCommand ToCommand(EndRoleHoldingRequest req) =>
        new()
        {
            RoleId = req.RoleId,
            RoleHoldingId = req.RoleHoldingId,
            EndedOn = req.EndedOn,
        };
}

public sealed record EndRoleHoldingRequest
{
    [RouteParam]
    public required int RoleId { get; init; }

    [RouteParam]
    public required int RoleHoldingId { get; init; }

    public required DateOnly EndedOn { get; init; }
}

public sealed class EndRoleHoldingValidator : Validator<EndRoleHoldingRequest>
{
    public EndRoleHoldingValidator()
    {
        RuleFor(request => request.RoleId).GreaterThan(0);
        RuleFor(request => request.RoleHoldingId).GreaterThan(0);
        RuleFor(request => request.EndedOn).NotEmpty();
    }
}
