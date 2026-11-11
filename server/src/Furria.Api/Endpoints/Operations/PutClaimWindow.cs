using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Operations;

public sealed class PutClaimWindow : Endpoint<PutClaimWindowRequest>
{
    private readonly ClaimWindowService _claimWindowService;

    public PutClaimWindow(ClaimWindowService claimWindowService)
    {
        _claimWindowService = claimWindowService;
    }

    public override void Configure()
    {
        Put("system/claim-window");
        Definition.RequirePermission(FurriaPermissions.ClaimWindowManage);
    }

    public override async Task HandleAsync(PutClaimWindowRequest req, CancellationToken ct)
    {
        var opened = await _claimWindowService.OpenUntilAsync(req.ClosesAt, User.PersonId(), ct);
        if (!opened.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(opened.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutClaimWindowRequest
{
    public required DateTimeOffset ClosesAt { get; init; }
}

public sealed class PutClaimWindowValidator : Validator<PutClaimWindowRequest>
{
    public PutClaimWindowValidator()
    {
        RuleFor(request => request.ClosesAt)
            .Must(closesAt => ClaimWindow.CanCloseAt(closesAt, Resolve<TimeProvider>().GetUtcNow()))
            .WithMessage(ClaimWindowService.EndOutOfRangeMessage);
    }
}
