using Furria.Application.Media;
using Furria.Core.Groups;

namespace Furria.Application.News;

public sealed record NewsMentionables
{
    public required IReadOnlyList<MentionableGroup> Groups { get; init; }

    public required IReadOnlyList<MentionablePerson> Persons { get; init; }
}

public sealed record MentionableGroup(
    int GroupId,
    string Name,
    string Description,
    GroupTone? Tone,
    PictureDetails? Picture
);

public sealed record MentionablePerson(
    int PersonId,
    string FirstName,
    string LastName,
    string OfficeName,
    PictureDetails? Portrait
);
