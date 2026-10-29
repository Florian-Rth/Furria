using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActCoEditor : Endpoint<PutActCoEditorRequest>
{
    private readonly ActStudioService _studioService;

    public PutActCoEditor(ActStudioService studioService)
    {
        _studioService = studioService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/co-editors/{personId}");
    }

    public override async Task HandleAsync(PutActCoEditorRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _studioService.GrantCoEditorAsync(
            accountId.Value,
            new ActPersonCommand { ActId = req.ActId, PersonId = req.PersonId },
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

public sealed record PutActCoEditorRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int PersonId { get; init; }
}

public sealed class PutActCoEditorValidator : Validator<PutActCoEditorRequest>
{
    public PutActCoEditorValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
