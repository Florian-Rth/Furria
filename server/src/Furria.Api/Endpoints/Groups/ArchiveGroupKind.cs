using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class ArchiveGroupKind : Endpoint<ArchiveGroupKindRequest>
{
    private readonly GroupKindService _groupKindService;

    public ArchiveGroupKind(GroupKindService groupKindService)
    {
        _groupKindService = groupKindService;
    }

    public override void Configure()
    {
        Post("manage/groups/kinds/{groupKindId}/archive");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(ArchiveGroupKindRequest req, CancellationToken ct)
    {
        var result = await _groupKindService.ArchiveAsync(req.GroupKindId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record ArchiveGroupKindRequest
{
    [RouteParam]
    public required int GroupKindId { get; init; }
}

public sealed class ArchiveGroupKindValidator : Validator<ArchiveGroupKindRequest>
{
    public ArchiveGroupKindValidator()
    {
        RuleFor(request => request.GroupKindId).GreaterThan(0);
    }
}
