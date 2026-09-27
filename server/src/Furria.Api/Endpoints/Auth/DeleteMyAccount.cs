using System.Text.Json;
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
    private const string PasskeyField = "passkey";

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
            await SendRefusalAsync(req, deleted.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private async Task SendRefusalAsync(
        DeleteMyAccountRequest req,
        ResultError error,
        CancellationToken ct
    )
    {
        if (error.Kind != ResultErrorKind.Unauthorized)
        {
            await HttpContext.Response.SendFailureAsync(error, ct);
            return;
        }

        ValidationFailures.Add(new ValidationFailure(ProvenFieldOf(req), error.Message));
        await Send.ErrorsAsync(StatusCodes.Status400BadRequest, ct);
    }

    private static string ProvenFieldOf(DeleteMyAccountRequest req) =>
        req.Passkey is null ? PasswordField : PasskeyField;

    private static DeleteAccountCommand ToCommand(DeleteMyAccountRequest req, int accountId) =>
        new() { AccountId = accountId, Proof = ToProof(req) };

    private static ReauthenticationProof ToProof(DeleteMyAccountRequest req) =>
        req.Passkey is { } passkey
            ? new PasskeyProof
            {
                Assertion = new PasskeyAssertion
                {
                    ChallengeId = passkey.ChallengeId,
                    CredentialJson = passkey.Credential.GetRawText(),
                },
            }
            : new PasswordProof { Password = req.Password ?? "" };
}

public sealed record DeleteMyAccountRequest
{
    public string? Password { get; init; }

    public DeleteMyAccountPasskeyDto? Passkey { get; init; }
}

public sealed record DeleteMyAccountPasskeyDto
{
    public required string ChallengeId { get; init; }

    public required JsonElement Credential { get; init; }
}

public sealed class DeleteMyAccountValidator : Validator<DeleteMyAccountRequest>
{
    public DeleteMyAccountValidator()
    {
        When(
            request => request.Passkey is null,
            () =>
                RuleFor(request => request.Password)
                    .NotEmpty()
                    .MaximumLength(RedeemInvitationValidator.MaximumPasswordLength)
        );
        When(
            request => request.Passkey is not null,
            () =>
            {
                RuleFor(request => request.Password).Null();
                RuleFor(request => request.Passkey!.ChallengeId)
                    .NotEmpty()
                    .MaximumLength(PasskeyCeremonyLimits.ChallengeIdLength)
                    .OverridePropertyName("passkey.challengeId");
                RuleFor(request => request.Passkey!.Credential)
                    .Must(PasskeyCeremonyLimits.IsCredential)
                    .OverridePropertyName("passkey.credential");
            }
        );
    }
}
