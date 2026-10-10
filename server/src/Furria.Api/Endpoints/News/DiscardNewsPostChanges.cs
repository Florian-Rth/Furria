using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class DiscardNewsPostChanges : Endpoint<DiscardNewsPostChangesRequest>
{
    private readonly NewsService _newsService;

    public DiscardNewsPostChanges(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Delete("news/{newsPostId}/pending-changes");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(DiscardNewsPostChangesRequest req, CancellationToken ct)
    {
        var result = await _newsService.DiscardChangesAsync(req.NewsPostId, User.PersonId(), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DiscardNewsPostChangesRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }
}

public sealed class DiscardNewsPostChangesValidator : Validator<DiscardNewsPostChangesRequest>
{
    public DiscardNewsPostChangesValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
    }
}
