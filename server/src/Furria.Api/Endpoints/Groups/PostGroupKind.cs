using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PostGroupKind : Endpoint<PostGroupKindRequest, PostGroupKindResponse>
{
    private readonly GroupKindService _groupKindService;

    public PostGroupKind(GroupKindService groupKindService)
    {
        _groupKindService = groupKindService;
    }

    public override void Configure()
    {
        Post("manage/groups/kinds");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(PostGroupKindRequest req, CancellationToken ct)
    {
        var result = await _groupKindService.CreateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static GroupKindCreateCommand ToCommand(PostGroupKindRequest req) =>
        new() { Name = req.Name, SortOrder = req.SortOrder };

    private static PostGroupKindResponse ToResponse(int groupKindId) =>
        new() { GroupKindId = groupKindId };
}

public sealed record PostGroupKindRequest
{
    public required string Name { get; init; }

    public required int SortOrder { get; init; }
}

public sealed class PostGroupKindValidator : Validator<PostGroupKindRequest>
{
    public PostGroupKindValidator()
    {
        RuleFor(request => request.Name).NotEmpty().MaximumLength(GroupLimits.KindNameLength);
        RuleFor(request => request.SortOrder)
            .InclusiveBetween(GroupLimits.MinSortOrder, GroupLimits.MaxSortOrder);
    }
}

public sealed record PostGroupKindResponse
{
    public required int GroupKindId { get; init; }
}
