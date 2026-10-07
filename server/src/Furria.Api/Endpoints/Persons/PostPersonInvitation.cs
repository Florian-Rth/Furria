using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Persons;

public sealed class PostPersonInvitation
    : Endpoint<PostPersonInvitationRequest, PostPersonInvitationResponse>
{
    private readonly AccountAccessService _accountAccessService;
    private readonly PermissionAuthorizer _authorizer;

    public PostPersonInvitation(
        AccountAccessService accountAccessService,
        PermissionAuthorizer authorizer
    )
    {
        _accountAccessService = accountAccessService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("manage/persons/{personId}/invitations");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PostPersonInvitationRequest req, CancellationToken ct)
    {
        if (User.AccountId() is not { } accountId)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var issuer = new InvitationIssuer
        {
            PersonId = User.PersonId(),
            VouchesForAge = await _authorizer.IsGrantedAsync(
                accountId,
                FurriaPermissions.AccountsManage,
                ct
            ),
        };
        var issued = await _accountAccessService.IssueMailInvitationAsync(req.PersonId, issuer, ct);
        if (!issued.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(issued.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(issued.Value), cancellation: ct);
    }

    private static PostPersonInvitationResponse ToResponse(IssuedInvitationDetails issued) =>
        new() { ExpiresAt = issued.ExpiresAt };
}

public sealed record PostPersonInvitationRequest
{
    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class PostPersonInvitationValidator : Validator<PostPersonInvitationRequest>
{
    public PostPersonInvitationValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}

public sealed record PostPersonInvitationResponse
{
    public required DateTimeOffset ExpiresAt { get; init; }
}
