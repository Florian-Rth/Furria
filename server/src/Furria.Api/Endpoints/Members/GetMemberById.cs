using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Members;

public sealed class GetMemberById : Endpoint<GetMemberByIdRequest, GetMemberByIdResponse>
{
    private readonly PersonService _personService;

    public GetMemberById(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Get("members/{personId}");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(GetMemberByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var member = await _personService.GetMemberAsync(req.PersonId, accountId.Value, ct);
        if (!member.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(member.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(member.Value), cancellation: ct);
    }

    private static GetMemberByIdResponse ToResponse(MemberDetails member) =>
        new()
        {
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            MembershipState = member.MembershipState,
            MemberSince = member.MemberSince,
            Groups = [.. member.Groups.Select(ToDto)],
            Roles = [.. member.Roles.Select(ToDto)],
            Contact = ToDto(member.Contact),
        };

    private static MemberGroupDto ToDto(MemberGroup group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Since = group.Since,
        };

    private static MemberRoleDto ToDto(MemberRole role) =>
        new()
        {
            RoleId = role.RoleId,
            Name = role.Name,
            Since = role.Since,
        };

    private static MemberContactDto ToDto(MemberContact contact) =>
        new()
        {
            Visibility = contact.Visibility,
            Phone = contact.Phone,
            Email = contact.Email,
            Street = contact.Street,
            Zip = contact.Zip,
            City = contact.City,
        };
}

public sealed record GetMemberByIdRequest
{
    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class GetMemberByIdValidator : Validator<GetMemberByIdRequest>
{
    public GetMemberByIdValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}

public sealed record GetMemberByIdResponse
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required MembershipState MembershipState { get; init; }

    public required DateOnly? MemberSince { get; init; }

    public required IReadOnlyList<MemberGroupDto> Groups { get; init; }

    public required IReadOnlyList<MemberRoleDto> Roles { get; init; }

    public required MemberContactDto Contact { get; init; }
}

public sealed record MemberGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required DateOnly Since { get; init; }
}

public sealed record MemberRoleDto
{
    public required int RoleId { get; init; }

    public required string Name { get; init; }

    public required DateOnly Since { get; init; }
}

public sealed record MemberContactDto
{
    public required ContactVisibility Visibility { get; init; }

    public required string? Phone { get; init; }

    public required string? Email { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }
}
