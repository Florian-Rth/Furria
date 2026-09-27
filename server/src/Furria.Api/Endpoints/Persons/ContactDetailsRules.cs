using FluentValidation;

namespace Furria.Api.Endpoints.Persons;

internal interface IContactDetailsRequest
{
    string? Email { get; }

    string? Phone { get; }

    string? Street { get; }

    string? Zip { get; }

    string? City { get; }
}

internal static class ContactDetailsRules
{
    internal static void RuleForContactDetails<TRequest>(this AbstractValidator<TRequest> validator)
        where TRequest : IContactDetailsRequest
    {
        validator
            .RuleFor(request => request.Email)
            .MaximumLength(PersonLimits.EmailLength)
            .EmailAddress()
            .When(request => request.Email is not (null or ""));
        validator.RuleFor(request => request.Phone).MaximumLength(PersonLimits.PhoneLength);
        validator.RuleFor(request => request.Street).MaximumLength(PersonLimits.StreetLength);
        validator.RuleFor(request => request.Zip).MaximumLength(PersonLimits.ZipLength);
        validator.RuleFor(request => request.City).MaximumLength(PersonLimits.CityLength);
    }
}
