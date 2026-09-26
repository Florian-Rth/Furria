using FastEndpoints;
using FluentValidation;
using FluentValidation.Results;
using Furria.Api.Authorization;
using Furria.Api.RateLimiting;
using Furria.Api.Results;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class PutMyLoginEmail : Endpoint<PutMyLoginEmailRequest, PutMyLoginEmailResponse>
{
    private const string LoginEmailField = "loginEmail";

    private readonly AccountSecurityService _accountSecurityService;
    private readonly AccountRateLimiter _accountRateLimiter;

    public PutMyLoginEmail(
        AccountSecurityService accountSecurityService,
        AccountRateLimiter accountRateLimiter
    )
    {
        _accountSecurityService = accountSecurityService;
        _accountRateLimiter = accountRateLimiter;
    }

    public override void Configure()
    {
        Put("auth/me/login-email");
    }

    public override async Task HandleAsync(PutMyLoginEmailRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (
            !_accountRateLimiter.TryAcquire(AccountRateLimitScope.LoginEmailChange, accountId.Value)
        )
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var requested = await _accountSecurityService.RequestLoginEmailChangeAsync(
            ToCommand(req, accountId.Value),
            ct
        );
        if (!requested.IsSuccess)
        {
            await SendRefusalAsync(requested.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PutMyLoginEmailResponse { ConfirmationExpiresAt = requested.Value },
            cancellation: ct
        );
    }

    private async Task SendRefusalAsync(ResultError error, CancellationToken ct)
    {
        if (error.Kind is not (ResultErrorKind.Validation or ResultErrorKind.Conflict))
        {
            await HttpContext.Response.SendFailureAsync(error, ct);
            return;
        }

        ValidationFailures.Add(new ValidationFailure(LoginEmailField, error.Message));
        await Send.ErrorsAsync(
            error.Kind == ResultErrorKind.Conflict
                ? StatusCodes.Status409Conflict
                : StatusCodes.Status400BadRequest,
            ct
        );
    }

    private static ChangeLoginEmailCommand ToCommand(PutMyLoginEmailRequest req, int accountId) =>
        new()
        {
            AccountId = accountId,
            LoginEmail = req.LoginEmail,
            UpdateContactEmail = req.UpdateContactEmail,
        };
}

public sealed record PutMyLoginEmailRequest
{
    public required string LoginEmail { get; init; }

    public bool UpdateContactEmail { get; init; } = true;
}

public sealed class PutMyLoginEmailValidator : Validator<PutMyLoginEmailRequest>
{
    public PutMyLoginEmailValidator()
    {
        RuleFor(request => request.LoginEmail)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(RedeemInvitationValidator.MaximumLoginEmailLength);
    }
}

public sealed record PutMyLoginEmailResponse
{
    public required DateTimeOffset ConfirmationExpiresAt { get; init; }
}
