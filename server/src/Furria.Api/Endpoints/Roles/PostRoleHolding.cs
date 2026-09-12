using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Roles;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class PostRoleHolding : Endpoint<PostRoleHoldingRequest, PostRoleHoldingResponse>
{
    private readonly RoleService _roleService;

    public PostRoleHolding(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Post("manage/roles/{roleId}/holdings");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(PostRoleHoldingRequest req, CancellationToken ct)
    {
        var result = await _roleService.AddHoldingAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static AddRoleHoldingCommand ToCommand(PostRoleHoldingRequest req) =>
        new()
        {
            RoleId = req.RoleId,
            PersonId = req.PersonId,
            SinceOn = req.SinceOn,
        };

    private static PostRoleHoldingResponse ToResponse(int roleHoldingId) =>
        new() { RoleHoldingId = roleHoldingId };
}

public sealed record PostRoleHoldingRequest
{
    [RouteParam]
    public required int RoleId { get; init; }

    public required int PersonId { get; init; }

    public required DateOnly SinceOn { get; init; }
}

public sealed class PostRoleHoldingValidator : Validator<PostRoleHoldingRequest>
{
    public PostRoleHoldingValidator()
    {
        RuleFor(request => request.RoleId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.SinceOn).NotEmpty();
    }
}

public sealed record PostRoleHoldingResponse
{
    public required int RoleHoldingId { get; init; }
}
