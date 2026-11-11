using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class GetChoosablePeople : EndpointWithoutRequest<GetChoosablePeopleResponse>
{
    private readonly ChoosablePeopleService _choosablePeopleService;

    public GetChoosablePeople(ChoosablePeopleService choosablePeopleService)
    {
        _choosablePeopleService = choosablePeopleService;
    }

    public override void Configure()
    {
        Get("calendar/choosable-people");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var people = await _choosablePeopleService.GetChoosablePeopleAsync(accountId.Value, ct);
        if (!people.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(people.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(people.Value), cancellation: ct);
    }

    private static GetChoosablePeopleResponse ToResponse(
        IReadOnlyList<ChoosablePersonSummary> people
    ) => new() { People = [.. people.Select(ToDto)] };

    private static ChoosablePersonSummaryDto ToDto(ChoosablePersonSummary person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
            GroupIds = person.GroupIds,
        };
}

public sealed record GetChoosablePeopleResponse
{
    public required IReadOnlyList<ChoosablePersonSummaryDto> People { get; init; }
}

public sealed record ChoosablePersonSummaryDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required IReadOnlyList<int> GroupIds { get; init; }
}
