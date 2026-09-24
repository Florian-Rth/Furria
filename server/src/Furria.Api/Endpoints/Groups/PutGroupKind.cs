using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PutGroupKind : Endpoint<PutGroupKindRequest>
{
    private readonly GroupKindService _groupKindService;

    public PutGroupKind(GroupKindService groupKindService)
    {
        _groupKindService = groupKindService;
    }

    public override void Configure()
    {
        Put("manage/groups/kinds/{groupKindId}");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(PutGroupKindRequest req, CancellationToken ct)
    {
        var result = await _groupKindService.UpdateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static GroupKindUpdateCommand ToCommand(PutGroupKindRequest req) =>
        new() { GroupKindId = req.GroupKindId, Name = req.Name };
}

public sealed record PutGroupKindRequest
{
    [RouteParam]
    public required int GroupKindId { get; init; }

    public required string Name { get; init; }
}

public sealed class PutGroupKindValidator : Validator<PutGroupKindRequest>
{
    public PutGroupKindValidator()
    {
        RuleFor(request => request.GroupKindId).GreaterThan(0);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(GroupLimits.KindNameLength);
    }
}
