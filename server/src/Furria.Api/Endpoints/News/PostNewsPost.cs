using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.News;
using Furria.Core.News;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class PostNewsPost : Endpoint<PostNewsPostRequest, PostNewsPostResponse>
{
    private readonly NewsService _newsService;

    public PostNewsPost(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Post("news");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(PostNewsPostRequest req, CancellationToken ct)
    {
        var result = await _newsService.CreateAsync(
            new CreateNewsPostCommand
            {
                AuthorPersonId = User.PersonId(),
                Content = new NewsPostContent
                {
                    Title = req.Title,
                    Teaser = req.Teaser,
                    Text = req.Text,
                    Category = req.Category,
                    EventId = req.EventId,
                    AlbumId = req.AlbumId,
                    PictureCaption = null,
                },
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostNewsPostResponse { NewsPostId = result.Value },
            cancellation: ct
        );
    }
}

public sealed record PostNewsPostRequest
{
    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required string Text { get; init; }

    public required NewsCategory? Category { get; init; }

    public required int? EventId { get; init; }

    public required int? AlbumId { get; init; }
}

public sealed class PostNewsPostValidator : Validator<PostNewsPostRequest>
{
    public PostNewsPostValidator()
    {
        RuleFor(request => request.Title)
            .NotNull()
            .MaximumLength(NewsPost.TitleLength)
            .SingleLine();
        RuleFor(request => request.Teaser)
            .NotNull()
            .MaximumLength(NewsPost.TeaserLength)
            .SingleLine();
        RuleFor(request => request.Text).NotNull().MaximumLength(NewsPost.TextLength);
        RuleFor(request => request.Category).IsInEnum();
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.AlbumId).GreaterThan(0);
    }
}

public sealed record PostNewsPostResponse
{
    public required int NewsPostId { get; init; }
}
