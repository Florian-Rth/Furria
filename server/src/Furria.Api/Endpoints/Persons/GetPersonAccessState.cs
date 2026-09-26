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

    public GetPersonAccessState(AccountAccessService accountAccessService)
    {
        _accountAccessService = accountAccessService;
    }

    public override void Configure()
    {
        Get("manage/persons/{personId}/access-state");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
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
            new GetPersonAccessStateResponse { State = state.Value },
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
}
