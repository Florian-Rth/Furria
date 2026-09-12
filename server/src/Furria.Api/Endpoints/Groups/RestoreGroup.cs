using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class RestoreGroup : Endpoint<RestoreGroupRequest>
{
    private readonly GroupService _groupService;

    public RestoreGroup(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Post("manage/groups/{groupId}/restore");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(RestoreGroupRequest req, CancellationToken ct)
    {
        var result = await _groupService.RestoreAsync(req.GroupId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record RestoreGroupRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class RestoreGroupValidator : Validator<RestoreGroupRequest>
{
    public RestoreGroupValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}
