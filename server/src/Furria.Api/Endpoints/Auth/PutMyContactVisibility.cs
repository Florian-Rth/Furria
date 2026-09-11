using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Auth;

public sealed class PutMyContactVisibility : Endpoint<PutMyContactVisibilityRequest>
{
    private readonly PersonService _personService;

    public PutMyContactVisibility(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Put("auth/me/contact-visibility");
    }

    public override async Task HandleAsync(PutMyContactVisibilityRequest req, CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _personService.SetContactVisibilityAsync(
            personId.Value,
            req.ContactVisibleToMembers,
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

public sealed record PutMyContactVisibilityRequest
{
    public required bool ContactVisibleToMembers { get; init; }
}

public sealed class PutMyContactVisibilityValidator : Validator<PutMyContactVisibilityRequest>;
