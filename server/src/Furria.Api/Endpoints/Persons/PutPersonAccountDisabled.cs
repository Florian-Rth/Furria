using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Persons;

public sealed class PutPersonAccountDisabled : Endpoint<PutPersonAccountDisabledRequest>
{
    private readonly AccountAdministrationService _accountAdministrationService;

    public PutPersonAccountDisabled(AccountAdministrationService accountAdministrationService)
    {
        _accountAdministrationService = accountAdministrationService;
    }

    public override void Configure()
    {
        Put("manage/persons/{personId}/account/disabled");
        Definition.RequirePermission(FurriaPermissions.AccountsManage);
    }

    public override async Task HandleAsync(
        PutPersonAccountDisabledRequest req,
        CancellationToken ct
    )
    {
        var result = await _accountAdministrationService.SetDisabledAsync(
            new AccountLockCommand
            {
                PersonId = req.PersonId,
                IsDisabled = req.IsDisabled,
                ActorPersonId = User.PersonId(),
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutPersonAccountDisabledRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    public required bool IsDisabled { get; init; }
}

public sealed class PutPersonAccountDisabledValidator : Validator<PutPersonAccountDisabledRequest>
{
    public PutPersonAccountDisabledValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
