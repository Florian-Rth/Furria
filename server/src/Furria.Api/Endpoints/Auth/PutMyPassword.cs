using FastEndpoints;
using FluentValidation;
using FluentValidation.Results;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class PutMyPassword : Endpoint<PutMyPasswordRequest, PutMyPasswordResponse>
{
    private const string CurrentPasswordField = "currentPassword";
    private const string NewPasswordField = "newPassword";

    private readonly AccountSecurityService _accountSecurityService;

    public PutMyPassword(AccountSecurityService accountSecurityService)
    {
        _accountSecurityService = accountSecurityService;
    }

    public override void Configure()
    {
        Put("auth/me/password");
    }

    public override async Task HandleAsync(PutMyPasswordRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var changed = await _accountSecurityService.ChangePasswordAsync(
            ToCommand(req, accountId.Value),
            ct
        );
        if (!changed.IsSuccess)
        {
            await SendRefusalAsync(changed.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(changed.Value), cancellation: ct);
    }

    private async Task SendRefusalAsync(ResultError error, CancellationToken ct)
    {
        var field = error.Kind switch
        {
            ResultErrorKind.Unauthorized => CurrentPasswordField,
            ResultErrorKind.Validation => NewPasswordField,
            _ => null,
        };
        if (field is null)
        {
            await HttpContext.Response.SendFailureAsync(error, ct);
            return;
        }

        ValidationFailures.Add(new ValidationFailure(field, error.Message));
        await Send.ErrorsAsync(StatusCodes.Status400BadRequest, ct);
    }

    private static ChangePasswordCommand ToCommand(PutMyPasswordRequest req, int accountId) =>
        new()
        {
            AccountId = accountId,
            CurrentPassword = req.CurrentPassword,
            NewPassword = req.NewPassword,
        };

    private static PutMyPasswordResponse ToResponse(SessionTokensDetails session) =>
        new()
        {
            AccessToken = session.AccessToken,
            AccessTokenExpiresAt = session.AccessTokenExpiresAt,
            RefreshToken = session.RefreshToken,
            RefreshTokenExpiresAt = session.RefreshTokenExpiresAt,
        };
}

public sealed record PutMyPasswordRequest
{
    public required string CurrentPassword { get; init; }

    public required string NewPassword { get; init; }
}

public sealed class PutMyPasswordValidator : Validator<PutMyPasswordRequest>
{
    public PutMyPasswordValidator()
    {
        RuleFor(request => request.CurrentPassword)
            .NotEmpty()
            .MaximumLength(RedeemInvitationValidator.MaximumPasswordLength);
        RuleFor(request => request.NewPassword)
            .NotEmpty()
            .MinimumLength(RedeemInvitationValidator.MinimumPasswordLength)
            .MaximumLength(RedeemInvitationValidator.MaximumPasswordLength);
    }
}

public sealed record PutMyPasswordResponse
{
    public required string AccessToken { get; init; }

    public required DateTimeOffset AccessTokenExpiresAt { get; init; }

    public required string RefreshToken { get; init; }

    public required DateTimeOffset RefreshTokenExpiresAt { get; init; }
}
