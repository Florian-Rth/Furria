using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Core.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Persons;

public sealed class GetPersonAccessState
    : Endpoint<GetPersonAccessStateRequest, GetPersonAccessStateResponse>
{
    private readonly AccountAccessService _accountAccessService;
    private readonly AccessRecoveryService _accessRecoveryService;

    public GetPersonAccessState(
        AccountAccessService accountAccessService,
        AccessRecoveryService accessRecoveryService
    )
    {
        _accountAccessService = accountAccessService;
        _accessRecoveryService = accessRecoveryService;
    }

    public override void Configure()
    {
        Get("manage/persons/{personId}/access-state");
        Definition.RequireAnyPermission(
            FurriaPermissions.PersonsManage,
            FurriaPermissions.AccountsManage,
            FurriaPermissions.PersonsDelete
        );
    }

    public override async Task HandleAsync(GetPersonAccessStateRequest req, CancellationToken ct)
    {
        var state = await _accountAccessService.GetAccessStateAsync(req.PersonId, ct);
        if (!state.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(state.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetPersonAccessStateResponse
            {
                State = state.Value,
                IsRecoveryOpen = await _accessRecoveryService.HasOpenRecoveryAsync(
                    req.PersonId,
                    ct
                ),
            },
            cancellation: ct
        );
    }
}

public sealed record GetPersonAccessStateRequest
{
    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class GetPersonAccessStateValidator : Validator<GetPersonAccessStateRequest>
{
    public GetPersonAccessStateValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}

public sealed record GetPersonAccessStateResponse
{
    public required AccountAccessState State { get; init; }

    public required bool IsRecoveryOpen { get; init; }
}
