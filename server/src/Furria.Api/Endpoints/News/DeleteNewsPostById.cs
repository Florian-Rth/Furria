using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class DeleteNewsPostById : Endpoint<DeleteNewsPostByIdRequest>
{
    private readonly NewsService _newsService;

    public DeleteNewsPostById(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Delete("news/{newsPostId}");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(DeleteNewsPostByIdRequest req, CancellationToken ct)
    {
        var result = await _newsService.DeleteAsync(req.NewsPostId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteNewsPostByIdRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }
}

public sealed class DeleteNewsPostByIdValidator : Validator<DeleteNewsPostByIdRequest>
{
    public DeleteNewsPostByIdValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
    }
}
