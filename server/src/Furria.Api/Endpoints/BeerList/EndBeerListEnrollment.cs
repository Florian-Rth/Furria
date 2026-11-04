using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class EndBeerListEnrollment : Endpoint<EndBeerListEnrollmentRequest>
{
    private readonly BeerListService _beerListService;

    public EndBeerListEnrollment(BeerListService beerListService)
    {
        _beerListService = beerListService;
    }

    public override void Configure()
    {
        Post("beer-list/enrollments/{enrollmentId}/end");
        Definition.RequirePermission(FurriaPermissions.BeerListManage);
    }

    public override async Task HandleAsync(EndBeerListEnrollmentRequest req, CancellationToken ct)
    {
        var result = await _beerListService.EndEnrollmentAsync(
            req.EnrollmentId,
            User.PersonId(),
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

public sealed record EndBeerListEnrollmentRequest
{
    [RouteParam]
    public required int EnrollmentId { get; init; }
}

public sealed class EndBeerListEnrollmentValidator : Validator<EndBeerListEnrollmentRequest>
{
    public EndBeerListEnrollmentValidator()
    {
        RuleFor(request => request.EnrollmentId).GreaterThan(0);
    }
}
