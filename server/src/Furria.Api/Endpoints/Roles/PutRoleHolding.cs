using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Roles;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class PutRoleHolding : Endpoint<PutRoleHoldingRequest>
{
    private readonly RoleService _roleService;

    public PutRoleHolding(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Put("manage/roles/{roleId}/holdings/{roleHoldingId}");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(PutRoleHoldingRequest req, CancellationToken ct)
    {
        var result = await _roleService.CorrectHoldingAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static CorrectRoleHoldingCommand ToCommand(PutRoleHoldingRequest req) =>
        new()
        {
            RoleId = req.RoleId,
            RoleHoldingId = req.RoleHoldingId,
            SinceOn = req.SinceOn,
            UntilOn = req.UntilOn,
        };
}

public sealed record PutRoleHoldingRequest
{
    [RouteParam]
    public required int RoleId { get; init; }

    [RouteParam]
    public required int RoleHoldingId { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}

public sealed class PutRoleHoldingValidator : Validator<PutRoleHoldingRequest>
{
    public PutRoleHoldingValidator()
    {
        RuleFor(request => request.RoleId).GreaterThan(0);
        RuleFor(request => request.RoleHoldingId).GreaterThan(0);
        RuleFor(request => request.SinceOn).NotEmpty();
    }
}
