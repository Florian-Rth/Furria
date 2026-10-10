using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class DeleteNewsPicture : Endpoint<DeleteNewsPictureRequest>
{
    private readonly NewsPictures _newsPictures;

    public DeleteNewsPicture(NewsPictures newsPictures)
    {
        _newsPictures = newsPictures;
    }

    public override void Configure()
    {
        Delete("news/{newsPostId}/picture");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(DeleteNewsPictureRequest req, CancellationToken ct)
    {
        var result = await _newsPictures.RemoveAsync(req.NewsPostId, User.PersonId(), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteNewsPictureRequest
{
    [RouteParam]
    public required int NewsPostId { get; init; }
}

public sealed class DeleteNewsPictureValidator : Validator<DeleteNewsPictureRequest>
{
    public DeleteNewsPictureValidator()
    {
        RuleFor(request => request.NewsPostId).GreaterThan(0);
    }
}
