using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Persons;

public sealed class PostPersonAccessRecovery
    : Endpoint<PostPersonAccessRecoveryRequest, PostPersonAccessRecoveryResponse>
{
    private readonly AccountAdministrationService _accountAdministrationService;

    public PostPersonAccessRecovery(AccountAdministrationService accountAdministrationService)
    {
        _accountAdministrationService = accountAdministrationService;
    }

    public override void Configure()
    {
        Post("manage/persons/{personId}/access-recovery");
        Definition.RequirePermission(FurriaPermissions.AccountsManage);
    }

    public override async Task HandleAsync(
        PostPersonAccessRecoveryRequest req,
        CancellationToken ct
    )
    {
        if (User.PersonId() is not { } issuerPersonId)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var issued = await _accountAdministrationService.IssueRecoveryAsync(
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

    private static PostPersonAccessRecoveryResponse ToResponse(
        IssuedInPersonInvitationDetails issued
    ) =>
        new()
        {
            Link = issued.Link,
            Code = issued.Code,
            ExpiresAt = issued.ExpiresAt,
        };
}

public sealed record PostPersonAccessRecoveryRequest
{
    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class PostPersonAccessRecoveryValidator : Validator<PostPersonAccessRecoveryRequest>
{
    public PostPersonAccessRecoveryValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}

public sealed record PostPersonAccessRecoveryResponse
{
    public required string Link { get; init; }

    public required string Code { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
