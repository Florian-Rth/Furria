using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Media;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Application.Identity;
using Furria.Application.Media;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Core.Media;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class GetPersonById : Endpoint<GetPersonByIdRequest, GetPersonByIdResponse>
{
    private readonly PersonService _personService;
    private readonly AccountAccessService _accountAccessService;
    private readonly PermissionAuthorizer _authorizer;
    private readonly ClubRecordService _clubRecordService;
    private readonly PictureService _pictureService;

    public GetPersonById(
        PersonService personService,
        AccountAccessService accountAccessService,
        PermissionAuthorizer authorizer,
        ClubRecordService clubRecordService,
        PictureService pictureService
    )
    {
        _personService = personService;
        _accountAccessService = accountAccessService;
        _authorizer = authorizer;
        _clubRecordService = clubRecordService;
        _pictureService = pictureService;
    }

    public override void Configure()
    {
        Get("manage/persons/{personId}");
        Definition.RequireAnyPermission(
            FurriaPermissions.PersonsManage,
            FurriaPermissions.AccountsManage,
            FurriaPermissions.PersonsDelete
        );
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

        var viewer = await ViewerOfAccessAsync(ct);
        var portrait = await _pictureService.EditingOfAsync(MediaOwner.Person(req.PersonId), ct);

        await Send.OkAsync(
            ToResponse(person.Value, access.Value, viewer, portrait),
            cancellation: ct
        );
    }

    private async Task<AccessViewer> ViewerOfAccessAsync(CancellationToken ct)
    {
        var granted = User.AccountId() is { } accountId
            ? await _authorizer.GrantedKeysAsync(accountId, ct)
            : [];
        var club = await _clubRecordService.GetAsync(ct);

        return new AccessViewer(
            granted.Contains(FurriaPermissions.PersonsManage),
            granted.Contains(FurriaPermissions.AccountsManage),
            club.AgeOfConsent
        );
    }

    private static GetPersonByIdResponse ToResponse(
        ManagedPersonDetails person,
        AccountAccessDetails access,
        AccessViewer viewer,
        PictureEditingDetails? portrait
    ) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Portrait = PictureEditingDto.From(portrait),
            Email = person.Email,
            Phone = person.Phone,
            Street = person.Street,
            Zip = person.Zip,
            City = person.City,
            BirthDate = person.BirthDate,
            ContactVisibleToMembers = person.ContactVisibleToMembers,
            ContactChange = person.ContactChange is { } change ? ToDto(change) : null,
            Archive = person.Archive is { } archive ? ToDto(archive) : null,
            MembershipState = person.MembershipState,
            MemberSince = person.MemberSince,
            Memberships =
            [
                .. person.Memberships.Select(membership => ToDto(membership, person.Admissions)),
            ],
            FeeReductions = [.. person.FeeReductions.Select(ToDto)],
            Groups = [.. person.Groups.Select(ToDto)],
            Roles = [.. person.Roles.Select(ToDto)],
            UnendedGroupAdminTenures = [.. person.UnendedGroupAdminTenures.Select(ToDto)],
            UnendedBoardSeats = [.. person.UnendedBoardSeats.Select(ToDto)],
            UnendedKeyHoldings = [.. person.UnendedKeyHoldings.Select(ToDto)],
            Access = ToDto(access, viewer),
        };

    private static PersonContactChangeDto ToDto(ContactChangeDetails change) =>
        new()
        {
            At = change.At,
            ChangedBy = change.ChangedBy is { } changedBy
                ? new()
                {
                    PersonId = changedBy.PersonId,
                    FirstName = changedBy.FirstName,
                    LastName = changedBy.LastName,
                }
                : null,
        };

    private static PersonArchiveDto ToDto(PersonArchiveDetails archive) =>
        new()
        {
            ArchivedOn = archive.ArchivedOn,
            ArchivedBy = archive.ArchivedBy is { } archivedBy
                ? new()
                {
                    PersonId = archivedBy.PersonId,
                    FirstName = archivedBy.FirstName,
                    LastName = archivedBy.LastName,
                }
                : null,
        };

    private static PersonAccessDto ToDto(AccountAccessDetails access, AccessViewer viewer) =>
        new()
        {
            State = access.State,
            Reason = access.Reason,
            Invitation = access.Invitation is { } invitation ? ToDto(invitation) : null,
            History = [.. access.History.Select(ToDto)],
            Rights = new()
            {
                CanInvite = viewer.CanInvite,
                CanManageAccount = viewer.CanManageAccount,
            },
            AgeOfConsent = viewer.AgeOfConsent,
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

    private static PersonMembershipDto ToDto(
        MembershipDetails membership,
        IReadOnlyList<MembershipAdmissionDetails> admissions
    ) =>
        new()
        {
            MembershipId = membership.MembershipId,
            StartedOn = membership.StartedOn,
            EndedOn = membership.EndedOn,
            IsRunning = membership.IsRunning,
            IsFuture = membership.IsFuture,
            Pauses = [.. membership.Pauses.Select(ToDto)],
            Admission = admissions
                .Where(admission => admission.MembershipId == membership.MembershipId)
                .Select(ToDto)
                .SingleOrDefault(),
        };

    private static PersonMembershipAdmissionDto ToDto(MembershipAdmissionDetails admission) =>
        new()
        {
            AdmittedAt = admission.AdmittedAt,
            AdmittedBy = admission.AdmittedBy is { } admitter
                ? new PersonMembershipAdmitterDto
                {
                    PersonId = admitter.PersonId,
                    FirstName = admitter.FirstName,
                    LastName = admitter.LastName,
                }
                : null,
            GuardianConsentConfirmed = admission.GuardianConsentConfirmed,
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

    private static PersonGroupAdminTenureDto ToDto(PersonGroupAdminTenure tenure) =>
        new()
        {
            GroupId = tenure.GroupId,
            Name = tenure.Name,
            Function = tenure.Function,
            SinceOn = tenure.SinceOn,
            UntilOn = tenure.UntilOn,
        };

    private static PersonBoardSeatDto ToDto(PersonBoardSeat seat) =>
        new()
        {
            BoardOfficeId = seat.BoardOfficeId,
            Name = seat.Name,
            SinceOn = seat.SinceOn,
            UntilOn = seat.UntilOn,
        };

    private static PersonKeyHoldingDto ToDto(PersonKeyHolding holding) =>
        new()
        {
            VenueId = holding.VenueId,
            Name = holding.Name,
            SinceOn = holding.SinceOn,
            UntilOn = holding.UntilOn,
        };

    private sealed record AccessViewer(bool CanInvite, bool CanManageAccount, int AgeOfConsent);
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

    public required PictureEditingDto? Portrait { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required DateOnly? BirthDate { get; init; }

    public required bool ContactVisibleToMembers { get; init; }

    public required PersonContactChangeDto? ContactChange { get; init; }

    public required PersonArchiveDto? Archive { get; init; }

    public required MembershipState MembershipState { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required IReadOnlyList<PersonMembershipDto> Memberships { get; init; }

    public required IReadOnlyList<PersonFeeReductionDto> FeeReductions { get; init; }

    public required IReadOnlyList<PersonGroupDto> Groups { get; init; }

    public required IReadOnlyList<PersonRoleDto> Roles { get; init; }

    public required IReadOnlyList<PersonGroupAdminTenureDto> UnendedGroupAdminTenures { get; init; }

    public required IReadOnlyList<PersonBoardSeatDto> UnendedBoardSeats { get; init; }

    public required IReadOnlyList<PersonKeyHoldingDto> UnendedKeyHoldings { get; init; }

    public required PersonAccessDto Access { get; init; }
}

public sealed record PersonContactChangeDto
{
    public required DateTimeOffset At { get; init; }

    public required PersonContactChangeActorDto? ChangedBy { get; init; }
}

public sealed record PersonContactChangeActorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}

public sealed record PersonArchiveDto
{
    public required DateOnly ArchivedOn { get; init; }

    public required PersonArchiveActorDto? ArchivedBy { get; init; }
}

public sealed record PersonArchiveActorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}

public sealed record PersonAccessDto
{
    public required AccountAccessState State { get; init; }

    public required AccountIneligibilityReason? Reason { get; init; }

    public required PersonAccessInvitationDto? Invitation { get; init; }

    public required IReadOnlyList<PersonAccessEventDto> History { get; init; }

    public required PersonAccessRightsDto Rights { get; init; }

    public required int AgeOfConsent { get; init; }
}

public sealed record PersonAccessRightsDto
{
    public required bool CanInvite { get; init; }

    public required bool CanManageAccount { get; init; }
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

    public required PersonMembershipAdmissionDto? Admission { get; init; }
}

public sealed record PersonMembershipAdmissionDto
{
    public required DateTimeOffset AdmittedAt { get; init; }

    public required PersonMembershipAdmitterDto? AdmittedBy { get; init; }

    public required bool GuardianConsentConfirmed { get; init; }
}

public sealed record PersonMembershipAdmitterDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
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

public sealed record PersonGroupAdminTenureDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string? Function { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}

public sealed record PersonBoardSeatDto
{
    public required int BoardOfficeId { get; init; }

    public required string Name { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}

public sealed record PersonKeyHoldingDto
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }
}
