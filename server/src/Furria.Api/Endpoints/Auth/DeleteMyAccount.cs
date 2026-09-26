using FastEndpoints;
using FluentValidation;
using FluentValidation.Results;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class DeleteMyAccount : Endpoint<DeleteMyAccountRequest>
{
    private const string PasswordField = "password";

    private readonly AccountSecurityService _accountSecurityService;

    public DeleteMyAccount(AccountSecurityService accountSecurityService)
    {
        _accountSecurityService = accountSecurityService;
    }

    public override void Configure()
    {
        Delete("auth/me");
    }

    public override async Task HandleAsync(DeleteMyAccountRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var deleted = await _accountSecurityService.DeleteAccountAsync(
            ToCommand(req, accountId.Value),
            ct
        );
        if (!deleted.IsSuccess)
        {
            await SendRefusalAsync(deleted.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private async Task SendRefusalAsync(ResultError error, CancellationToken ct)
    {
        if (error.Kind != ResultErrorKind.Unauthorized)
        {
            await HttpContext.Response.SendFailureAsync(error, ct);
            return;
        }

        ValidationFailures.Add(new ValidationFailure(PasswordField, error.Message));
        await Send.ErrorsAsync(StatusCodes.Status400BadRequest, ct);
    }

    private static DeleteAccountCommand ToCommand(DeleteMyAccountRequest req, int accountId) =>
        new()
        {
            AccountId = accountId,
            Proof = new ReauthenticationProof { Password = req.Password },
        };
}

public sealed record DeleteMyAccountRequest
{
    public required string Password { get; init; }
}

public sealed class DeleteMyAccountValidator : Validator<DeleteMyAccountRequest>
{
    public DeleteMyAccountValidator()
    {
        RuleFor(request => request.Password)
            .NotEmpty()
            .MaximumLength(RedeemInvitationValidator.MaximumPasswordLength);
    }
}
