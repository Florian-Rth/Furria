using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class PutPerson : Endpoint<PutPersonRequest>
{
    private readonly PersonService _personService;

    public PutPerson(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Put("manage/persons/{personId}");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PutPersonRequest req, CancellationToken ct)
    {
        var result = await _personService.UpdateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdatePersonCommand ToCommand(PutPersonRequest req) =>
        new()
        {
            PersonId = req.PersonId,
            FirstName = req.FirstName,
            LastName = req.LastName,
            Email = req.Email,
            Phone = req.Phone,
            Street = req.Street,
            Zip = req.Zip,
            City = req.City,
            BirthDate = req.BirthDate,
            ContactVisibleToMembers = req.ContactVisibleToMembers,
        };
}

public sealed record PutPersonRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required DateOnly? BirthDate { get; init; }

    public required bool ContactVisibleToMembers { get; init; }
}

public sealed class PutPersonValidator : Validator<PutPersonRequest>
{
    public PutPersonValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(PersonLimits.NameLength);
        RuleFor(request => request.LastName).NotEmpty().MaximumLength(PersonLimits.NameLength);
        RuleFor(request => request.Email)
            .MaximumLength(PersonLimits.EmailLength)
            .EmailAddress()
            .When(request => !string.IsNullOrEmpty(request.Email));
        RuleFor(request => request.Phone).MaximumLength(PersonLimits.PhoneLength);
        RuleFor(request => request.Street).MaximumLength(PersonLimits.StreetLength);
        RuleFor(request => request.Zip).MaximumLength(PersonLimits.ZipLength);
        RuleFor(request => request.City).MaximumLength(PersonLimits.CityLength);
    }
}
