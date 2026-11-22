using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Auth;

public sealed class PutMyClubGroupConsent : Endpoint<PutMyClubGroupConsentRequest>
{
    private readonly PersonService _personService;

    public PutMyClubGroupConsent(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Put("auth/me/club-group-consent");
    }

    public override async Task HandleAsync(PutMyClubGroupConsentRequest req, CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _personService.SetClubGroupConsentAsync(
            personId.Value,
            req.ClubGroupConsent,
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutMyClubGroupConsentRequest
{
    public required bool ClubGroupConsent { get; init; }
}

public sealed class PutMyClubGroupConsentValidator : Validator<PutMyClubGroupConsentRequest>;
