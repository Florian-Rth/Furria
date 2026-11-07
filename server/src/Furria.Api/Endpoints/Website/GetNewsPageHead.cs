using FastEndpoints;
using FluentValidation;
using Furria.Api.Website;
using Furria.Application.Website;
using Furria.Core.News;
using Furria.Infrastructure.News;
using Microsoft.Extensions.Options;

namespace Furria.Api.Endpoints.Website;

public sealed class GetNewsPageHead : Endpoint<GetNewsPageHeadRequest>
{
    private readonly NewsService _newsService;
    private readonly WebsiteOptions _websiteOptions;

    public GetNewsPageHead(NewsService newsService, IOptions<WebsiteOptions> websiteOptions)
    {
        _newsService = newsService;
        _websiteOptions = websiteOptions.Value;
    }

    public override void Configure()
    {
        Get("public/page-heads/news/{slug}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetNewsPageHeadRequest req, CancellationToken ct)
    {
        var shown = await _newsService.GetPublicNewsPostAsync(req.Slug, ct);
        if (shown is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.StringAsync(
            PageHeadHtml.Of(PageHeads.Of(shown), _websiteOptions.BaseUrl),
            StatusCodes.Status200OK,
            PageHeadHtml.ContentType,
            ct
        );
    }
}

public sealed record GetNewsPageHeadRequest
{
    [RouteParam]
    public required string Slug { get; init; }
}

public sealed class GetNewsPageHeadValidator : Validator<GetNewsPageHeadRequest>
{
    public GetNewsPageHeadValidator()
    {
        RuleFor(request => request.Slug).NotEmpty().MaximumLength(NewsSlug.StoredLength);
    }
}
