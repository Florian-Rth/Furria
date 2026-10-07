using System.Text.Json;
using FastEndpoints;
using FluentValidation;
using FluentValidation.Results;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Application.Registry;
using Furria.Application.Results;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class DeletePersonById : Endpoint<DeletePersonByIdRequest>
{
    private const string PasswordField = "password";
    private const string PasskeyField = "passkey";

    private readonly PersonErasureService _personErasureService;

    public DeletePersonById(PersonErasureService personErasureService)
    {
        _personErasureService = personErasureService;
    }

    public override void Configure()
    {
        Delete("manage/persons/{personId}");
        Definition.RequirePermission(FurriaPermissions.PersonsDelete);
    }

    public override async Task HandleAsync(DeletePersonByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var erased = await _personErasureService.EraseAsync(ToCommand(req, accountId.Value), ct);
        if (!erased.IsSuccess)
        {
            await SendRefusalAsync(req, erased.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private async Task SendRefusalAsync(
        DeletePersonByIdRequest req,
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

    private static string ProvenFieldOf(DeletePersonByIdRequest req) =>
        req.Passkey is null ? PasswordField : PasskeyField;

    private static PersonErasureCommand ToCommand(DeletePersonByIdRequest req, int accountId) =>
        new()
        {
            PersonId = req.PersonId,
            ActorAccountId = accountId,
            Proof = ToProof(req),
        };

    private static ReauthenticationProof ToProof(DeletePersonByIdRequest req) =>
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

public sealed record DeletePersonByIdRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    public string? Password { get; init; }

    public DeletePersonByIdPasskeyDto? Passkey { get; init; }
}

public sealed record DeletePersonByIdPasskeyDto
{
    public required string ChallengeId { get; init; }

    public required JsonElement Credential { get; init; }
}

public sealed class DeletePersonByIdValidator : Validator<DeletePersonByIdRequest>
{
    public DeletePersonByIdValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
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
