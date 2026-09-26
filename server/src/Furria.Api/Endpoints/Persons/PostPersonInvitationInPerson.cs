using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Persons;

public sealed class PostPersonInvitationInPerson
    : Endpoint<PostPersonInvitationInPersonRequest, PostPersonInvitationInPersonResponse>
{
    private readonly AccountAccessService _accountAccessService;

    public PostPersonInvitationInPerson(AccountAccessService accountAccessService)
    {
        _accountAccessService = accountAccessService;
    }

    public override void Configure()
    {
        Post("manage/persons/{personId}/invitations/in-person");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(
        PostPersonInvitationInPersonRequest req,
        CancellationToken ct
    )
    {
        if (User.PersonId() is not { } issuerPersonId)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var issued = await _accountAccessService.IssueInPersonInvitationAsync(
            req.PersonId,
            issuerPersonId,
            ct
        );
        if (!issued.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(issued.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(issued.Value), cancellation: ct);
    }

    private static PostPersonInvitationInPersonResponse ToResponse(
        IssuedInPersonInvitationDetails issued
    ) =>
        new()
        {
            Link = issued.Link,
            Code = issued.Code,
            ExpiresAt = issued.ExpiresAt,
        };
}

public sealed record PostPersonInvitationInPersonRequest
{
    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class PostPersonInvitationInPersonValidator
    : Validator<PostPersonInvitationInPersonRequest>
{
    public PostPersonInvitationInPersonValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}

public sealed record PostPersonInvitationInPersonResponse
{
    public required string Link { get; init; }

    public required string Code { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
