using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class PublishNewsPostChanges
    : Endpoint<PublishNewsPostChangesRequest, PublishNewsPostChangesResponse>
{
    private readonly NewsService _newsService;

    public PublishNewsPostChanges(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Post("news/{newsPostId}/pending-changes/publication");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(PublishNewsPostChangesRequest req, CancellationToken ct)
    {
        var result = await _newsService.PublishChangesAsync(req.NewsPostId, User.PersonId(), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PublishNewsPostChangesResponse
            {
                Slug = result.Value.Slug,
                PublishedAt = result.Value.PublishedAt,
                Revision = result.Value.Revision,
            },
            cancellation: ct
        );
    }
}

public sealed record PublishNewsPostChangesRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }
}

public sealed class PublishNewsPostChangesValidator : Validator<PublishNewsPostChangesRequest>
{
    public PublishNewsPostChangesValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
    }
}

public sealed record PublishNewsPostChangesResponse
{
    public required string Slug { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required int Revision { get; init; }
}
