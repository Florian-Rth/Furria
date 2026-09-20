using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Identity;
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
        };

    private static MeMembershipDto ToDto(MembershipChainDetails membership) =>
        new()
        {
            State = membership.State,
            MemberSince = membership.MemberSince,
            CurrentStartedOn = membership.Current?.StartedOn,
            CurrentEndedOn = membership.Current?.EndedOn,
        };
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
}

public sealed record MeMembershipDto
{
    public required MembershipState State { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required DateOnly? CurrentStartedOn { get; init; }

    public required DateOnly? CurrentEndedOn { get; init; }
}
