namespace Furria.Application.Club;

public sealed record ClubHubKeyHolder
{
    public required ClubHubPerson Person { get; init; }

    public required DateOnly SinceOn { get; init; }
}
