using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class RestoreGroupKind : Endpoint<RestoreGroupKindRequest>
{
    private readonly GroupKindService _groupKindService;

    public RestoreGroupKind(GroupKindService groupKindService)
    {
        _groupKindService = groupKindService;
    }

    public override void Configure()
    {
        Post("manage/groups/kinds/{groupKindId}/restore");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(RestoreGroupKindRequest req, CancellationToken ct)
    {
        var result = await _groupKindService.RestoreAsync(req.GroupKindId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record RestoreGroupKindRequest
{
    [RouteParam]
    public required int GroupKindId { get; init; }
}

public sealed class RestoreGroupKindValidator : Validator<RestoreGroupKindRequest>
{
    public RestoreGroupKindValidator()
    {
        RuleFor(request => request.GroupKindId).GreaterThan(0);
    }
}
