using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.News;
using Furria.Core.News;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class PutNewsPost : Endpoint<PutNewsPostRequest, PutNewsPostResponse>
{
    private readonly NewsService _newsService;

    public PutNewsPost(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Put("news/{newsPostId}");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(PutNewsPostRequest req, CancellationToken ct)
    {
        var result = await _newsService.SaveAsync(ToCommand(req, User.PersonId()), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PutNewsPostResponse
            {
                Revision = result.Value.Revision,
                SavedInBetween = result.Value.SavedInBetween is { } inBetween
                    ? new PutNewsPostInBetweenDto
                    {
                        SavedBy = inBetween.SavedBy is { } savedBy
                            ? new PutNewsPostSaverDto
                            {
                                PersonId = savedBy.PersonId,
                                FirstName = savedBy.FirstName,
                                LastName = savedBy.LastName,
                            }
                            : null,
                        SavedAt = inBetween.SavedAt,
                    }
                    : null,
            },
            cancellation: ct
        );
    }

    private static SaveNewsPostCommand ToCommand(PutNewsPostRequest req, int? savedByPersonId) =>
        new()
        {
            NewsPostId = req.NewsPostId,
            BasedOnRevision = req.BasedOnRevision,
            Content = new NewsPostContent
            {
                Title = req.Title,
                Teaser = req.Teaser,
                Text = req.Text,
                Category = req.Category,
                EventId = req.EventId,
                AlbumId = req.AlbumId,
                PictureCaption = string.IsNullOrWhiteSpace(req.PictureCaption)
                    ? null
                    : req.PictureCaption,
            },
            SavedByPersonId = savedByPersonId,
        };
}

public sealed record PutNewsPostRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }

    public required int BasedOnRevision { get; init; }

    public required string Title { get; init; }

    public required string Teaser { get; init; }

    public required string Text { get; init; }

    public required NewsCategory? Category { get; init; }

    public required int? EventId { get; init; }

    public required int? AlbumId { get; init; }

    public required string? PictureCaption { get; init; }
}

public sealed class PutNewsPostValidator : Validator<PutNewsPostRequest>
{
    public PutNewsPostValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
        RuleFor(request => request.BasedOnRevision).GreaterThan(0);
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
        RuleFor(request => request.PictureCaption)
            .MaximumLength(NewsPost.PictureCaptionLength)
            .SingleLine();
    }
}

public sealed record PutNewsPostResponse
{
    public required int Revision { get; init; }

    public required PutNewsPostInBetweenDto? SavedInBetween { get; init; }
}

public sealed record PutNewsPostInBetweenDto
{
    public required PutNewsPostSaverDto? SavedBy { get; init; }

    public required DateTimeOffset SavedAt { get; init; }
}

public sealed record PutNewsPostSaverDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
