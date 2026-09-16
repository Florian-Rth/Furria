using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Registry;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class GetPersonSearch : Endpoint<GetPersonSearchRequest, GetPersonSearchResponse>
{
    private readonly PersonService _personService;
    private readonly PermissionAuthorizer _authorizer;

    public GetPersonSearch(PersonService personService, PermissionAuthorizer authorizer)
    {
        _personService = personService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("person-search");
    }

    public override async Task HandleAsync(GetPersonSearchRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.CanSearchPersonsAsync(accountId.Value, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var persons = await _personService.SearchPersonsAsync(req.Query, ct);

        await Send.OkAsync(ToResponse(persons), cancellation: ct);
    }

    private static GetPersonSearchResponse ToResponse(IReadOnlyList<PersonSearchSummary> persons) =>
        new() { Persons = [.. persons.Select(ToDto)] };

    private static PersonRefDto ToDto(PersonSearchSummary person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
        };
}

public sealed record GetPersonSearchRequest
{
    [QueryParam]
    [BindFrom("q")]
    public required string Query { get; init; }
}

public sealed class GetPersonSearchValidator : Validator<GetPersonSearchRequest>
{
    private const int MinimumQueryLength = 2;
    private const int MaximumQueryLength = 64;

    public GetPersonSearchValidator()
    {
        RuleFor(request => request.Query)
            .NotEmpty()
            .MinimumLength(MinimumQueryLength)
            .MaximumLength(MaximumQueryLength);
    }
}

public sealed record GetPersonSearchResponse
{
    public required IReadOnlyList<PersonRefDto> Persons { get; init; }
}

public sealed record PersonRefDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
