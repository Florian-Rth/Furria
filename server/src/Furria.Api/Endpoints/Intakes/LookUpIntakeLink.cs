using FastEndpoints;
using FluentValidation;
using Furria.Api.RateLimiting;
using Furria.Application.Intakes;
using Furria.Core.Intakes;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Endpoints.Intakes;

public sealed class LookUpIntakeLink : Endpoint<LookUpIntakeLinkRequest, LookUpIntakeLinkResponse>
{
    private readonly IntakeService _intakeService;

    public LookUpIntakeLink(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    public override void Configure()
    {
        Post("public/intakes/lookup");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.OnboardingPerIpPolicy));
    }

    public override async Task HandleAsync(LookUpIntakeLinkRequest req, CancellationToken ct)
    {
        var link = await _intakeService.LookUpLinkAsync(req.Token, ct);
        if (link is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        await Send.OkAsync(ToResponse(link), cancellation: ct);
    }

    private static LookUpIntakeLinkResponse ToResponse(IntakeLinkLookup link) =>
        new()
        {
            ClubName = link.ClubName,
            State = link.State,
            AddressRequired = link.AddressRequired,
        };
}

public sealed record LookUpIntakeLinkRequest
{
    public required string Token { get; init; }
}

public sealed class LookUpIntakeLinkValidator : Validator<LookUpIntakeLinkRequest>
{
    public LookUpIntakeLinkValidator()
    {
        RuleFor(request => request.Token).NotEmpty().MaximumLength(Intake.TokenLength);
    }
}

public sealed record LookUpIntakeLinkResponse
{
    public required string? ClubName { get; init; }

    public required IntakeLinkState State { get; init; }

    public required bool AddressRequired { get; init; }
}
