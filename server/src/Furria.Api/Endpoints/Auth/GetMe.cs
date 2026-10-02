using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Identity;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class GetMe : EndpointWithoutRequest<GetMeResponse>
{
    private readonly AccountService _accountService;

    public GetMe(AccountService accountService)
    {
        _accountService = accountService;
    }

    public override void Configure()
    {
        Get("auth/me");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var account = await _accountService.GetDetailsAsync(accountId.Value, ct);
        if (!account.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(account.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(account.Value), cancellation: ct);
    }

    private static GetMeResponse ToResponse(AccountDetails account) =>
        new()
        {
            AccountId = account.Id,
            Email = account.Email,
            Person = ToDto(account.Person),
            Membership = ToDto(account.Membership),
            IsAffiliated = account.IsAffiliated,
            PermissionKeys = account.PermissionKeys,
            LastSeenAnnouncementAt = account.LastSeenAnnouncementAt,
            AppSince = account.AppSince,
            Passkeys = [.. account.Passkeys.Select(ToDto)],
        };

    private static MePasskeyDto ToDto(PasskeyDetails passkey) =>
        new()
        {
            Id = passkey.Id,
            Name = passkey.Name,
            AddedAt = passkey.AddedAt,
        };

    private static MePersonDto ToDto(PersonDetails person) =>
        new()
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Email = person.Email,
            Phone = person.Phone,
            Street = person.Street,
            Zip = person.Zip,
            City = person.City,
            BirthDate = person.BirthDate,
            ContactVisibleToMembers = person.ContactVisibleToMembers,
            ContactChange = person.ContactChange is { } change ? ToDto(change) : null,
        };

    private static MeContactChangeDto ToDto(ContactChangeDetails change) =>
        new()
        {
            At = change.At,
            ChangedBy = new()
            {
                PersonId = change.ChangedBy.PersonId,
                FirstName = change.ChangedBy.FirstName,
                LastName = change.ChangedBy.LastName,
            },
        };

    private static MeMembershipDto ToDto(MembershipChainDetails membership) =>
        new()
        {
            State = membership.State,
            MemberSince = membership.MemberSince,
            CurrentStartedOn = membership.Current?.StartedOn,
            CurrentEndedOn = membership.Current?.EndedOn,
            RelevantSession = membership.RelevantSession is { } session ? ToDto(session) : null,
        };

    private static MeRelevantSessionDto ToDto(RelevantSessionDetails session) =>
        new() { StartYear = session.StartYear, Ordinal = session.Ordinal };
}

public sealed record GetMeResponse
{
    public required int AccountId { get; init; }

    public required string Email { get; init; }

    public required MePersonDto Person { get; init; }

    public required MeMembershipDto Membership { get; init; }

    public required bool IsAffiliated { get; init; }

    public required IReadOnlyList<string> PermissionKeys { get; init; }

    public required DateTimeOffset? LastSeenAnnouncementAt { get; init; }

    public required DateOnly? AppSince { get; init; }

    public required IReadOnlyList<MePasskeyDto> Passkeys { get; init; }
}

public sealed record MePasskeyDto
{
    public required string Id { get; init; }

    public required string Name { get; init; }

    public required DateTimeOffset AddedAt { get; init; }
}

public sealed record MePersonDto
{
    public required int Id { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required DateOnly? BirthDate { get; init; }

    public required bool ContactVisibleToMembers { get; init; }

    public required MeContactChangeDto? ContactChange { get; init; }
}

public sealed record MeContactChangeDto
{
    public required DateTimeOffset At { get; init; }

    public required MeContactChangeActorDto ChangedBy { get; init; }
}

public sealed record MeContactChangeActorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}

public sealed record MeMembershipDto
{
    public required MembershipState State { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required DateOnly? CurrentStartedOn { get; init; }

    public required DateOnly? CurrentEndedOn { get; init; }

    public required MeRelevantSessionDto? RelevantSession { get; init; }
}

public sealed record MeRelevantSessionDto
{
    public required int StartYear { get; init; }

    public required int Ordinal { get; init; }
}
