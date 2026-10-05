using FastEndpoints;
using FluentValidation;
using Furria.Api.Altcha;
using Furria.Api.RateLimiting;
using Furria.Api.Results;
using Furria.Application.MembershipApplications;
using Furria.Core.MembershipApplications;
using Furria.Infrastructure.MembershipApplications;

namespace Furria.Api.Endpoints.MembershipApplications;

public sealed class PostMembershipApplication
    : Endpoint<PostMembershipApplicationRequest, PostMembershipApplicationResponse>
{
    private const string AltchaRefusedMessage =
        "Die Sicherheitsprüfung ist abgelaufen oder ungültig. Bitte versuch es noch einmal.";

    private readonly MembershipApplicationService _membershipApplicationService;
    private readonly AltchaChallenges _altchaChallenges;
    private readonly AddressRateLimiter _addressRateLimiter;

    public PostMembershipApplication(
        MembershipApplicationService membershipApplicationService,
        AltchaChallenges altchaChallenges,
        AddressRateLimiter addressRateLimiter
    )
    {
        _membershipApplicationService = membershipApplicationService;
        _altchaChallenges = altchaChallenges;
        _addressRateLimiter = addressRateLimiter;
    }

    public override void Configure()
    {
        Post("membership-applications");
        AllowAnonymous();
        Options(route => route.RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy));
    }

    public override async Task HandleAsync(
        PostMembershipApplicationRequest req,
        CancellationToken ct
    )
    {
        if (_altchaChallenges.Redeem(req.Altcha) is not null)
        {
            AddError(request => request.Altcha, AltchaRefusedMessage);
            await Send.ErrorsAsync(cancellation: ct);
            return;
        }

        if (!_addressRateLimiter.TryAcquire(AddressRateLimitScope.MembershipApplication, req.Email))
        {
            await Send.StatusCodeAsync(StatusCodes.Status429TooManyRequests, ct);
            return;
        }

        var result = await _membershipApplicationService.SubmitAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PostMembershipApplicationResponse(), cancellation: ct);
    }

    private static SubmitMembershipApplicationCommand ToCommand(
        PostMembershipApplicationRequest req
    ) =>
        new()
        {
            FirstName = req.FirstName,
            LastName = req.LastName,
            BirthDate = req.BirthDate,
            Street = req.Street,
            Zip = req.PostalCode,
            City = req.City,
            Email = req.Email,
            Phone = req.Phone,
        };
}

public sealed record PostMembershipApplicationRequest
{
    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly BirthDate { get; init; }

    public required string Street { get; init; }

    public required string PostalCode { get; init; }

    public required string City { get; init; }

    public required string Email { get; init; }

    public required string? Phone { get; init; }

    public required bool ConsentAccepted { get; init; }

    public required string Altcha { get; init; }
}

public sealed class PostMembershipApplicationValidator : Validator<PostMembershipApplicationRequest>
{
    private const int AltchaLength = 4_096;
    private const string PostalCodePattern = @"^(?:0[1-9]|[1-9]\d)\d{3}$";
    private const string PhonePattern = @"^[+0][\d\s()/.-]{5,30}$";

    public PostMembershipApplicationValidator()
    {
        RuleFor(request => request.FirstName)
            .NotEmpty()
            .MaximumLength(MembershipApplication.NameLength);
        RuleFor(request => request.LastName)
            .NotEmpty()
            .MaximumLength(MembershipApplication.NameLength);
        RuleFor(request => request.Street)
            .NotEmpty()
            .MaximumLength(MembershipApplication.StreetLength);
        RuleFor(request => request.PostalCode).Matches(PostalCodePattern);
        RuleFor(request => request.City).NotEmpty().MaximumLength(MembershipApplication.CityLength);
        RuleFor(request => request.Email)
            .NotEmpty()
            .MaximumLength(MembershipApplication.EmailLength)
            .EmailAddress();
        RuleFor(request => request.Phone)
            .Matches(PhonePattern)
            .When(request => request.Phone is not (null or ""));
        RuleFor(request => request.ConsentAccepted).Equal(true);
        RuleFor(request => request.Altcha).NotEmpty().MaximumLength(AltchaLength);
    }
}

public sealed record PostMembershipApplicationResponse;
