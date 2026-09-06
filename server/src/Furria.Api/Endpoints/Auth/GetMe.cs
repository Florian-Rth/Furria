using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Identity;
using Furria.Core.Identity;
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
            await Send.NotFoundAsync(ct);
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
            Membership = account.Membership is null ? null : ToDto(account.Membership),
        };

    private static AccountPersonDetailsDto ToDto(PersonDetails person) =>
        new()
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Email = person.Email,
            Phone = person.Phone,
        };

    private static AccountMembershipDetailsDto ToDto(MembershipDetails membership) =>
        new()
        {
            Type = membership.Type,
            Status = membership.Status,
            StartedAt = membership.StartedAt,
            EndedAt = membership.EndedAt,
        };
}

public sealed record GetMeResponse
{
    public required int AccountId { get; init; }

    public required string Email { get; init; }

    public required AccountPersonDetailsDto Person { get; init; }

    public required AccountMembershipDetailsDto? Membership { get; init; }
}

public sealed record AccountPersonDetailsDto
{
    public required int Id { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }
}

public sealed record AccountMembershipDetailsDto
{
    public required MembershipType Type { get; init; }

    public required MembershipStatus Status { get; init; }

    public required DateOnly StartedAt { get; init; }

    public required DateOnly? EndedAt { get; init; }
}
