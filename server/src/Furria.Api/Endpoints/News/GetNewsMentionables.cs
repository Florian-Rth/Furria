using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Media;
using Furria.Application.Authorization;
using Furria.Application.News;
using Furria.Core.Groups;
using Furria.Infrastructure.News;

namespace Furria.Api.Endpoints.News;

public sealed class GetNewsMentionables : EndpointWithoutRequest<GetNewsMentionablesResponse>
{
    private readonly NewsService _newsService;

    public GetNewsMentionables(NewsService newsService)
    {
        _newsService = newsService;
    }

    public override void Configure()
    {
        Get("news/mentionables");
        Definition.RequirePermission(FurriaPermissions.NewsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var mentionables = await _newsService.GetMentionablesAsync(ct);

        await Send.OkAsync(ToResponse(mentionables), cancellation: ct);
    }

    private static GetNewsMentionablesResponse ToResponse(NewsMentionables mentionables) =>
        new()
        {
            Groups =
            [
                .. mentionables.Groups.Select(group => new MentionableGroupDto
                {
                    GroupId = group.GroupId,
                    Name = group.Name,
                    Description = group.Description,
                    Tone = group.Tone,
                    Picture = PictureDto.From(group.Picture),
                }),
            ],
            Persons =
            [
                .. mentionables.Persons.Select(person => new MentionablePersonDto
                {
                    PersonId = person.PersonId,
                    FirstName = person.FirstName,
                    LastName = person.LastName,
                    OfficeName = person.OfficeName,
                    Portrait = PictureDto.From(person.Portrait),
                }),
            ],
        };
}

public sealed record GetNewsMentionablesResponse
{
    public required IReadOnlyList<MentionableGroupDto> Groups { get; init; }

    public required IReadOnlyList<MentionablePersonDto> Persons { get; init; }
}

public sealed record MentionableGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required GroupTone? Tone { get; init; }

    public required PictureDto? Picture { get; init; }
}

public sealed record MentionablePersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string OfficeName { get; init; }

    public required PictureDto? Portrait { get; init; }
}
