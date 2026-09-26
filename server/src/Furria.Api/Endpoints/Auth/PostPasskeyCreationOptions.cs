using System.Text.Json;
using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Auth;

public sealed class PostPasskeyCreationOptions
    : EndpointWithoutRequest<PostPasskeyCreationOptionsResponse>
{
    private readonly PasskeyService _passkeyService;

    public PostPasskeyCreationOptions(PasskeyService passkeyService)
    {
        _passkeyService = passkeyService;
    }

    public override void Configure()
    {
        Post("auth/me/passkeys/creation-options");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var created = await _passkeyService.MakeCreationOptionsAsync(accountId.Value, ct);
        if (!created.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(created.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(created.Value), cancellation: ct);
    }

    private static PostPasskeyCreationOptionsResponse ToResponse(PasskeyOptionsDetails options) =>
        new()
        {
            ChallengeId = options.ChallengeId,
            Options = PasskeyCeremonyLimits.OptionsOf(options.OptionsJson),
        };
}

public sealed record PostPasskeyCreationOptionsResponse
{
    public required string ChallengeId { get; init; }

    public required JsonElement Options { get; init; }
}
