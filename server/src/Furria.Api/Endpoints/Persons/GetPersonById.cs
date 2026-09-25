using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Application.Identity;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class GetPersonById : Endpoint<GetPersonByIdRequest, GetPersonByIdResponse>
{
    private readonly PersonService _personService;
    private readonly AccountAccessService _accountAccessService;

    public GetPersonById(PersonService personService, AccountAccessService accountAccessService)
    {
        _personService = personService;
        _accountAccessService = accountAccessService;
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

        var access = await _accountAccessService.GetAccessAsync(req.PersonId, ct);
        if (!access.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(access.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(person.Value, access.Value), cancellation: ct);
    }

    private static GetPersonByIdResponse ToResponse(
        ManagedPersonDetails person,
        AccountAccessDetails access
    ) =>
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
            Access = ToDto(access),
        };

    private static PersonAccessDto ToDto(AccountAccessDetails access) =>
        new()
        {
            State = access.State,
            Reason = access.Reason,
            Invitation = access.Invitation is { } invitation ? ToDto(invitation) : null,
            History = [.. access.History.Select(ToDto)],
        };

    private static PersonAccessInvitationDto ToDto(LiveInvitationDetails invitation) =>
        new()
        {
            Channel = invitation.Channel,
            IssuedAt = invitation.IssuedAt,
            IssuedBy = ToDto(invitation.IssuedBy),
            ExpiresAt = invitation.ExpiresAt,
            IsExpired = invitation.IsExpired,
        };

    private static PersonAccessEventDto ToDto(AccountEventDetails accountEvent) =>
        new()
        {
            Kind = accountEvent.Kind,
            At = accountEvent.At,
            Actor = ToDto(accountEvent.Actor),
        };

    private static PersonAccessActorDto? ToDto(PersonReference? person) =>
        person is null
            ? null
            : new()
            {
                PersonId = person.PersonId,
                FirstName = person.FirstName,
                LastName = person.LastName,
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

    public required PersonAccessDto Access { get; init; }
}

public sealed record PersonAccessDto
{
    public required AccountAccessState State { get; init; }

    public required AccountIneligibilityReason? Reason { get; init; }

    public required PersonAccessInvitationDto? Invitation { get; init; }

    public required IReadOnlyList<PersonAccessEventDto> History { get; init; }
}

public sealed record PersonAccessInvitationDto
{
    public required InvitationChannel Channel { get; init; }

    public required DateTimeOffset IssuedAt { get; init; }

    public required PersonAccessActorDto? IssuedBy { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }

    public required bool IsExpired { get; init; }
}

public sealed record PersonAccessEventDto
{
    public required AccountEventKind Kind { get; init; }

    public required DateTimeOffset At { get; init; }

    public required PersonAccessActorDto? Actor { get; init; }
}

public sealed record PersonAccessActorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
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
