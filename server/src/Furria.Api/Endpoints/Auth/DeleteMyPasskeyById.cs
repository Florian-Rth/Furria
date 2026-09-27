using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class DeleteMyPasskeyById : Endpoint<DeleteMyPasskeyByIdRequest>
{
    private readonly PasskeyService _passkeyService;

    public DeleteMyPasskeyById(PasskeyService passkeyService)
    {
        _passkeyService = passkeyService;
    }

    public override void Configure()
    {
        Delete("auth/me/passkeys/{passkeyId}");
    }

    public override async Task HandleAsync(DeleteMyPasskeyByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var removed = await _passkeyService.RemoveAsync(accountId.Value, req.PasskeyId, ct);
        if (!removed.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(removed.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteMyPasskeyByIdRequest
{
    public required string PasskeyId { get; init; }
}

public sealed class DeleteMyPasskeyByIdValidator : Validator<DeleteMyPasskeyByIdRequest>
{
    public DeleteMyPasskeyByIdValidator()
    {
        RuleFor(request => request.PasskeyId)
            .NotEmpty()
            .MaximumLength(PasskeyCeremonyLimits.PasskeyIdLength)
            .Matches(PasskeyCeremonyLimits.PasskeyIdPattern);
    }
}
