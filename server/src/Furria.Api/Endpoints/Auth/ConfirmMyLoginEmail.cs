using FastEndpoints;
using FluentValidation;
using FluentValidation.Results;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Results;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class ConfirmMyLoginEmail : Endpoint<ConfirmMyLoginEmailRequest>
{
    private const string CodeField = "code";
    private const string LoginEmailField = "loginEmail";

    private readonly AccountSecurityService _accountSecurityService;

    public ConfirmMyLoginEmail(AccountSecurityService accountSecurityService)
    {
        _accountSecurityService = accountSecurityService;
    }

    public override void Configure()
    {
        Post("auth/me/login-email/confirmation");
    }

    public override async Task HandleAsync(ConfirmMyLoginEmailRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var confirmed = await _accountSecurityService.ConfirmLoginEmailChangeAsync(
            accountId.Value,
            req.Code,
            ct
        );
        if (!confirmed.IsSuccess)
        {
            await SendRefusalAsync(confirmed.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private async Task SendRefusalAsync(ResultError error, CancellationToken ct)
    {
        switch (error.Kind)
        {
            case ResultErrorKind.Validation:
                ValidationFailures.Add(new ValidationFailure(CodeField, error.Message));
                await Send.ErrorsAsync(StatusCodes.Status400BadRequest, ct);
                return;
            case ResultErrorKind.Conflict:
                ValidationFailures.Add(new ValidationFailure(LoginEmailField, error.Message));
                await Send.ErrorsAsync(StatusCodes.Status409Conflict, ct);
                return;
            default:
                await HttpContext.Response.SendFailureAsync(error, ct);
                return;
        }
    }
}

public sealed record ConfirmMyLoginEmailRequest
{
    public required string Code { get; init; }
}

public sealed class ConfirmMyLoginEmailValidator : Validator<ConfirmMyLoginEmailRequest>
{
    public ConfirmMyLoginEmailValidator()
    {
        RuleFor(request => request.Code)
            .NotEmpty()
            .MaximumLength(RedeemInvitationValidator.MaximumConfirmationCodeLength);
    }
}
