using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class PostPerson : Endpoint<PostPersonRequest, PostPersonResponse>
{
    private readonly PersonService _personService;

    public PostPerson(PersonService personService)
    {
        _personService = personService;
    }

    public override void Configure()
    {
        Post("manage/persons");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PostPersonRequest req, CancellationToken ct)
    {
        var result = await _personService.CreateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static CreatePersonCommand ToCommand(PostPersonRequest req) =>
        new()
        {
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

    private static PostPersonResponse ToResponse(int personId) => new() { PersonId = personId };
}

public sealed record PostPersonRequest
{
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

public sealed class PostPersonValidator : Validator<PostPersonRequest>
{
    public PostPersonValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(PersonLimits.NameLength);
        RuleFor(request => request.LastName).NotEmpty().MaximumLength(PersonLimits.NameLength);
        RuleFor(request => request.Email)
            .MaximumLength(PersonLimits.EmailLength)
            .EmailAddress()
            .When(request => request.Email is not (null or ""));
        RuleFor(request => request.Phone).MaximumLength(PersonLimits.PhoneLength);
        RuleFor(request => request.Street).MaximumLength(PersonLimits.StreetLength);
        RuleFor(request => request.Zip).MaximumLength(PersonLimits.ZipLength);
        RuleFor(request => request.City).MaximumLength(PersonLimits.CityLength);
    }
}

public sealed record PostPersonResponse
{
    public required int PersonId { get; init; }
}
