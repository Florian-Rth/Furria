using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class PublishNewsPost : Endpoint<PublishNewsPostRequest, PublishNewsPostResponse>
{
    private readonly NewsService _newsService;

    public PublishNewsPost(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Post("news/{newsPostId}/publication");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(PublishNewsPostRequest req, CancellationToken ct)
    {
        var result = await _newsService.PublishAsync(req.NewsPostId, User.PersonId(), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PublishNewsPostResponse
            {
                Slug = result.Value.Slug,
                PublishedAt = result.Value.PublishedAt,
                Revision = result.Value.Revision,
            },
            cancellation: ct
        );
    }
}

public sealed record PublishNewsPostRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }
}

public sealed class PublishNewsPostValidator : Validator<PublishNewsPostRequest>
{
    public PublishNewsPostValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
    }
}

public sealed record PublishNewsPostResponse
{
    public required string Slug { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required int Revision { get; init; }
}
