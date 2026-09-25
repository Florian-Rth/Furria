using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Persons;

public sealed class PostPersonInvitation
    : Endpoint<PostPersonInvitationRequest, PostPersonInvitationResponse>
{
    private readonly AccountAccessService _accountAccessService;

    public PostPersonInvitation(AccountAccessService accountAccessService)
    {
        _accountAccessService = accountAccessService;
    }

    public override void Configure()
    {
        Post("manage/persons/{personId}/invitations");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PostPersonInvitationRequest req, CancellationToken ct)
    {
        if (User.PersonId() is not { } issuerPersonId)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var issued = await _accountAccessService.IssueMailInvitationAsync(
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
