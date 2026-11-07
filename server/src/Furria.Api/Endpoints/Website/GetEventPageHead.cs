using FastEndpoints;
using FluentValidation;
using Furria.Api.Website;
using Furria.Application.Website;
using Furria.Core.Website;
using Furria.Infrastructure.Events;
using Microsoft.Extensions.Options;

namespace Furria.Api.Endpoints.Website;

public sealed class GetEventPageHead : Endpoint<GetEventPageHeadRequest>
{
    private readonly EventService _eventService;
    private readonly WebsiteOptions _websiteOptions;

    public GetEventPageHead(EventService eventService, IOptions<WebsiteOptions> websiteOptions)
    {
        _eventService = eventService;
        _websiteOptions = websiteOptions.Value;
    }

    public override void Configure()
    {
        Get("public/page-heads/events/{slug}");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetEventPageHeadRequest req, CancellationToken ct)
    {
        var shown = WebsiteAddress.IdOf(req.Slug) is { } eventId
            ? await _eventService.GetPublicEventAsync(eventId, ct)
            : null;
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

public sealed record GetEventPageHeadRequest
{
    [RouteParam]
    public required string Slug { get; init; }
}

public sealed class GetEventPageHeadValidator : Validator<GetEventPageHeadRequest>
{
    public GetEventPageHeadValidator()
    {
        RuleFor(request => request.Slug).NotEmpty().MaximumLength(WebsiteAddress.MaxSlugLength);
    }
}
