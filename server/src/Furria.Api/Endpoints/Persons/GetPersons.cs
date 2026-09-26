using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class GetPersons : Endpoint<GetPersonsRequest, GetPersonsResponse>
{
    private readonly PersonService _personService;

    public GetPersons(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Get("manage/persons");
        Definition.RequireAnyPermission(
            FurriaPermissions.PersonsManage,
            FurriaPermissions.AccountsManage
        );
    }

    public override async Task HandleAsync(GetPersonsRequest req, CancellationToken ct)
    {
        var persons = await _personService.GetAllAsync(PersonAccessFilters.Parse(req.Access), ct);

        await Send.OkAsync(ToResponse(persons), cancellation: ct);
    }

    private static GetPersonsResponse ToResponse(IReadOnlyList<PersonSummary> persons) =>
        new() { Persons = [.. persons.Select(ToDto)] };

    private static PersonSummaryDto ToDto(PersonSummary person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Email = person.Email,
            Phone = person.Phone,
            Street = person.Street,
            Zip = person.Zip,
            City = person.City,
            BirthDate = person.BirthDate,
            ContactVisibleToMembers = person.ContactVisibleToMembers,
            MembershipState = person.MembershipState,
            MemberSince = person.MemberSince,
            Groups = [.. person.Groups.Select(ToDto)],
            Roles = [.. person.Roles.Select(ToDto)],
        };

    private static GroupRefDto ToDto(GroupReference group) =>
        new() { GroupId = group.GroupId, Name = group.Name };

    private static RoleRefDto ToDto(RoleReference role) =>
        new() { RoleId = role.RoleId, Name = role.Name };
}

public sealed record GetPersonsRequest
{
    [QueryParam]
    public string? Access { get; init; }
}

public sealed class GetPersonsValidator : Validator<GetPersonsRequest>
{
    private const string UnknownAccessMessage = "Diesen Zugangsfilter gibt es nicht.";

    public GetPersonsValidator()
    {
        RuleFor(request => request.Access)
            .Must(PersonAccessFilters.IsKnown)
            .When(request => request.Access is not null)
            .WithMessage(UnknownAccessMessage);
    }
}

public sealed record GetPersonsResponse
{
    public required IReadOnlyList<PersonSummaryDto> Persons { get; init; }
}

public sealed record PersonSummaryDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required DateOnly? BirthDate { get; init; }

    public required bool ContactVisibleToMembers { get; init; }

    public required MembershipState MembershipState { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required IReadOnlyList<GroupRefDto> Groups { get; init; }

    public required IReadOnlyList<RoleRefDto> Roles { get; init; }
}

public sealed record GroupRefDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }
}

public sealed record RoleRefDto
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }
}
