using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class GetPersonById : Endpoint<GetPersonByIdRequest, GetPersonByIdResponse>
{
    private readonly PersonService _personService;

    public GetPersonById(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Get("manage/persons/{personId}");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(GetPersonByIdRequest req, CancellationToken ct)
    {
        var person = await _personService.GetPersonAsync(req.PersonId, ct);
        if (!person.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(person.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(person.Value), cancellation: ct);
    }

    private static GetPersonByIdResponse ToResponse(ManagedPersonDetails person) =>
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
            Memberships = [.. person.Memberships.Select(ToDto)],
            FeeReductions = [.. person.FeeReductions.Select(ToDto)],
            Groups = [.. person.Groups.Select(ToDto)],
            Roles = [.. person.Roles.Select(ToDto)],
        };

    private static PersonMembershipDto ToDto(MembershipDetails membership) =>
        new()
        {
            MembershipId = membership.MembershipId,
            StartedOn = membership.StartedOn,
            EndedOn = membership.EndedOn,
            IsRunning = membership.IsRunning,
            IsFuture = membership.IsFuture,
            Pauses = [.. membership.Pauses.Select(ToDto)],
        };

    private static PersonPauseDto ToDto(MembershipPauseDetails pause) =>
        new()
        {
            PauseId = pause.PauseId,
            FirstSessionYear = pause.FirstSessionYear,
            LastSessionYear = pause.LastSessionYear,
        };

    private static PersonFeeReductionDto ToDto(PersonFeeReduction reduction) =>
        new()
        {
            FeeReductionId = reduction.FeeReductionId,
            Basis = reduction.Basis,
            FirstSessionYear = reduction.FirstSessionYear,
            LastSessionYear = reduction.LastSessionYear,
        };

    private static PersonGroupDto ToDto(PersonGroup group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            JoinedOn = group.JoinedOn,
            LeftOn = group.LeftOn,
        };

    private static PersonRoleDto ToDto(PersonRole role) =>
        new()
        {
            RoleId = role.RoleId,
            Name = role.Name,
            SinceOn = role.SinceOn,
            UntilOn = role.UntilOn,
        };
}

public sealed record GetPersonByIdRequest
{
    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class GetPersonByIdValidator : Validator<GetPersonByIdRequest>
{
    public GetPersonByIdValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}

public sealed record GetPersonByIdResponse
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

    public required IReadOnlyList<PersonMembershipDto> Memberships { get; init; }

    public required IReadOnlyList<PersonFeeReductionDto> FeeReductions { get; init; }

    public required IReadOnlyList<PersonGroupDto> Groups { get; init; }

    public required IReadOnlyList<PersonRoleDto> Roles { get; init; }
}

public sealed record PersonMembershipDto
{
    public required int MembershipId { get; init; }

    public required DateOnly StartedOn { get; init; }

    public required DateOnly? EndedOn { get; init; }

    public required bool IsRunning { get; init; }

    public required bool IsFuture { get; init; }

    public required IReadOnlyList<PersonPauseDto> Pauses { get; init; }
}

public sealed record PersonPauseDto
{
    public required int PauseId { get; init; }

    public required int FirstSessionYear { get; init; }

    public required int? LastSessionYear { get; init; }
}

public sealed record PersonFeeReductionDto
{
    public required int FeeReductionId { get; init; }

    public required FeeReductionBasis Basis { get; init; }

    public required int FirstSessionYear { get; init; }

    public required int LastSessionYear { get; init; }
}

public sealed record PersonGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required DateOnly JoinedOn { get; init; }

    public required DateOnly? LeftOn { get; init; }
}

public sealed record PersonRoleDto
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}
