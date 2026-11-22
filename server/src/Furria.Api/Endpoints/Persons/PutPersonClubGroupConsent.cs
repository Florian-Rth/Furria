using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class PutPersonClubGroupConsent : Endpoint<PutPersonClubGroupConsentRequest>
{
    private readonly PersonService _personService;

    public PutPersonClubGroupConsent(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Put("manage/persons/{personId}/club-group-consent");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(
        PutPersonClubGroupConsentRequest req,
        CancellationToken ct
    )
    {
        var result = await _personService.SetClubGroupConsentOnHerWordAsync(
            req.PersonId,
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

public sealed record PutPersonClubGroupConsentRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    public required bool ClubGroupConsent { get; init; }
}

public sealed class PutPersonClubGroupConsentValidator : Validator<PutPersonClubGroupConsentRequest>
{
    public PutPersonClubGroupConsentValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
