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

public sealed class PostMyPasskey : Endpoint<PostMyPasskeyRequest, PostMyPasskeyResponse>
{
    private const string CredentialField = "credential";

    private readonly PasskeyService _passkeyService;

    public PostMyPasskey(PasskeyService passkeyService)
    {
        _passkeyService = passkeyService;
    }

    public override void Configure()
    {
        Post("auth/me/passkeys");
    }

    public override async Task HandleAsync(PostMyPasskeyRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var added = await _passkeyService.AddAsync(ToCommand(req, accountId.Value), ct);
        if (!added.IsSuccess)
        {
            await SendRefusalAsync(added.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(added.Value), cancellation: ct);
    }

    private async Task SendRefusalAsync(ResultError error, CancellationToken ct)
    {
        if (error.Kind != ResultErrorKind.Validation)
        {
            await HttpContext.Response.SendFailureAsync(error, ct);
            return;
        }

        ValidationFailures.Add(new ValidationFailure(CredentialField, error.Message));
        await Send.ErrorsAsync(StatusCodes.Status400BadRequest, ct);
    }

    private static AddPasskeyCommand ToCommand(PostMyPasskeyRequest req, int accountId) =>
        new()
        {
            AccountId = accountId,
            ChallengeId = req.ChallengeId,
            CredentialJson = req.Credential.GetRawText(),
            Name = req.Name,
        };

    private static PostMyPasskeyResponse ToResponse(PasskeyDetails passkey) =>
        new()
        {
            Id = passkey.Id,
            Name = passkey.Name,
            AddedAt = passkey.AddedAt,
        };
}

public sealed record PostMyPasskeyRequest
{
    public required string ChallengeId { get; init; }

    public required JsonElement Credential { get; init; }

    public string? Name { get; init; }
}

public sealed class PostMyPasskeyValidator : Validator<PostMyPasskeyRequest>
{
    public PostMyPasskeyValidator()
    {
        RuleFor(request => request.ChallengeId)
            .NotEmpty()
            .MaximumLength(PasskeyCeremonyLimits.ChallengeIdLength);
        RuleFor(request => request.Credential).Must(PasskeyCeremonyLimits.IsCredential);
        RuleFor(request => request.Name).MaximumLength(PasskeyName.MaxLength);
    }
}

public sealed record PostMyPasskeyResponse
{
    public required string Id { get; init; }

    public required string Name { get; init; }

    public required DateTimeOffset AddedAt { get; init; }
}
