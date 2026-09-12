using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Roles;
using Furria.Infrastructure.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed class PutRolePermissions : Endpoint<PutRolePermissionsRequest>
{
    private readonly RoleService _roleService;

    public PutRolePermissions(RoleService roleService)
    {
        _roleService = roleService;
    }

    public override void Configure()
    {
        Put("manage/roles/{roleId}/permissions");
        Definition.RequirePermission(FurriaPermissions.RolesManage);
    }

    public override async Task HandleAsync(PutRolePermissionsRequest req, CancellationToken ct)
    {
        var result = await _roleService.SetPermissionsAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static SetRolePermissionsCommand ToCommand(PutRolePermissionsRequest req) =>
        new() { RoleId = req.RoleId, PermissionKeys = req.PermissionKeys };
}

public sealed record PutRolePermissionsRequest
{
    [RouteParam]
    public required int RoleId { get; init; }

    public required IReadOnlyList<string> PermissionKeys { get; init; }
}

public sealed class PutRolePermissionsValidator : Validator<PutRolePermissionsRequest>
{
    private const string UnknownKeyMessage = "Unbekannter Berechtigungs-Key.";
    private const string DuplicateKeyMessage = "Ein Berechtigungs-Key steht doppelt in der Liste.";

    public PutRolePermissionsValidator()
    {
        RuleFor(request => request.RoleId).GreaterThan(0);
        RuleFor(request => request.PermissionKeys).NotNull();
        RuleForEach(request => request.PermissionKeys)
            .Must(key => FurriaPermissions.All.Contains(key))
            .WithMessage(UnknownKeyMessage);
        RuleFor(request => request.PermissionKeys)
            .Must(keys => keys.Distinct(StringComparer.Ordinal).Count() == keys.Count)
            .WithMessage(DuplicateKeyMessage)
            .When(request => request.PermissionKeys is not null);
    }
}
