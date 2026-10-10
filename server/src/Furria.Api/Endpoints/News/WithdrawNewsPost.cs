using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class WithdrawNewsPost : Endpoint<WithdrawNewsPostRequest>
{
    private readonly NewsService _newsService;

    public WithdrawNewsPost(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Delete("news/{newsPostId}/publication");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(WithdrawNewsPostRequest req, CancellationToken ct)
    {
        var result = await _newsService.WithdrawAsync(req.NewsPostId, User.PersonId(), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record WithdrawNewsPostRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }
}

public sealed class WithdrawNewsPostValidator : Validator<WithdrawNewsPostRequest>
{
    public WithdrawNewsPostValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
    }
}
