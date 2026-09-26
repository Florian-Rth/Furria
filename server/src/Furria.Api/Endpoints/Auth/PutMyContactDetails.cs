using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Results;
using Furria.Application.Registry;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Auth;

public sealed class PutMyContactDetails : Endpoint<PutMyContactDetailsRequest>
{
    private readonly PersonService _personService;

    public PutMyContactDetails(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Put("auth/me/contact-details");
    }

    public override async Task HandleAsync(PutMyContactDetailsRequest req, CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _personService.UpdateOwnContactDetailsAsync(
            ToCommand(req, personId.Value),
            ct
        );

        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateOwnContactDetailsCommand ToCommand(
        PutMyContactDetailsRequest req,
        int personId
    ) =>
        new()
        {
            PersonId = personId,
            Email = req.Email,
            Phone = req.Phone,
            Street = req.Street,
            Zip = req.Zip,
            City = req.City,
        };
}

public sealed record PutMyContactDetailsRequest : IContactDetailsRequest
{
    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }
}

public sealed class PutMyContactDetailsValidator : Validator<PutMyContactDetailsRequest>
{
    public PutMyContactDetailsValidator()
    {
        this.RuleForContactDetails();
    }
}
