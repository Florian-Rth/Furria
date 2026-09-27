using FastEndpoints;
using FluentValidation;
using FluentValidation.Results;
using Furria.Api.RateLimiting;
using Furria.Application.Identity;
using Furria.Application.Results;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class ResetPassword : Endpoint<ResetPasswordRequest>
{
    private const string ResetField = "reset";
    private const string PasswordField = "password";

    private readonly PasswordResetService _passwordResetService;
    private readonly InvitationTokenRateLimiter _tokenRateLimiter;

    public ResetPassword(
        PasswordResetService passwordResetService,
        InvitationTokenRateLimiter tokenRateLimiter
    )
    {
        _passwordResetService = passwordResetService;
        _tokenRateLimiter = tokenRateLimiter;
    }

    public override void Configure()
    {
        Post("auth/password/reset");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(ResetPasswordRequest req, CancellationToken ct)
    {
        if (!_tokenRateLimiter.TryAcquire(req.Reset))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var reset = await _passwordResetService.ResetAsync(ToCommand(req), ct);
        if (!reset.IsSuccess)
        {
            ValidationFailures.Add(
                new ValidationFailure(FieldOf(reset.Error), reset.Error.Message)
            );
            await Send.ErrorsAsync(StatusCodes.Status400BadRequest, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static ResetPasswordCommand ToCommand(ResetPasswordRequest request) =>
        new() { Reset = request.Reset, Password = request.Password };

    private static string FieldOf(ResultError error) =>
        error.Kind == ResultErrorKind.Validation ? PasswordField : ResetField;
}

public sealed record ResetPasswordRequest
{
    public required string Reset { get; init; }

    public required string Password { get; init; }
}

public sealed class ResetPasswordValidator : Validator<ResetPasswordRequest>
{
    private const int PasswordMaxLength = 256;

    public ResetPasswordValidator()
    {
        RuleFor(request => request.Reset)
            .NotEmpty()
            .MaximumLength(PasswordResetLink.PresentedMaxLength);
        RuleFor(request => request.Password).NotEmpty().MaximumLength(PasswordMaxLength);
    }
}
