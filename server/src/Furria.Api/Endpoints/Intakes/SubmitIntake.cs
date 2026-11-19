using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Api.Results;
using Furria.Application.Intakes;
using Furria.Core.Intakes;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Endpoints.Intakes;

public sealed class SubmitIntake : Endpoint<SubmitIntakeRequest, SubmitIntakeResponse>
{
    private readonly IntakeService _intakeService;

    public SubmitIntake(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    public override void Configure()
    {
        Post("public/intakes/submit");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.OnboardingPerIpPolicy));
    }

    public override async Task HandleAsync(SubmitIntakeRequest req, CancellationToken ct)
    {
        var result = await _intakeService.SubmitAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new SubmitIntakeResponse { InvitationLink = result.Value.InvitationLink },
            cancellation: ct
        );
    }

    private static SubmitIntakeCommand ToCommand(SubmitIntakeRequest req) =>
        new()
        {
            Token = req.Token,
            FirstName = req.FirstName,
            LastName = req.LastName,
            BirthDate = req.BirthDate,
            Street = req.Street,
            Zip = req.Zip,
            City = req.City,
            Phone = req.Phone,
            Email = req.Email,
            ContactVisibleToMembers = req.ContactVisibleToMembers,
        };
}

public sealed record SubmitIntakeRequest
{
    public required string Token { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly BirthDate { get; init; }

    public string? Street { get; init; }

    public string? Zip { get; init; }

    public string? City { get; init; }

    public string? Phone { get; init; }

    public string? Email { get; init; }

    public bool ContactVisibleToMembers { get; init; }
}

public sealed class SubmitIntakeValidator : Validator<SubmitIntakeRequest>
{
    private static readonly DateOnly EarliestBirthDate = new(1900, 1, 1);

    public SubmitIntakeValidator()
    {
        RuleFor(request => request.Token).NotEmpty().MaximumLength(Intake.TokenLength);
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(Intake.NameLength);
        RuleFor(request => request.LastName).NotEmpty().MaximumLength(Intake.NameLength);
        RuleFor(request => request.BirthDate).GreaterThanOrEqualTo(EarliestBirthDate);
        RuleFor(request => request.Street).MaximumLength(Intake.StreetLength);
        RuleFor(request => request.Zip).MaximumLength(Intake.ZipLength);
        RuleFor(request => request.City).MaximumLength(Intake.CityLength);
        RuleFor(request => request.Phone).MaximumLength(Intake.PhoneLength);
        RuleFor(request => request.Email)
            .MaximumLength(Intake.EmailLength)
            .EmailAddress()
            .When(request => !string.IsNullOrWhiteSpace(request.Email));
    }
}

public sealed record SubmitIntakeResponse
{
    public required string? InvitationLink { get; init; }
}
