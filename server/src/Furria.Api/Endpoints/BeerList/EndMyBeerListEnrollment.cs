using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class EndMyBeerListEnrollment : EndpointWithoutRequest
{
    private readonly BeerListService _beerListService;

    public EndMyBeerListEnrollment(BeerListService beerListService)
    {
        _beerListService = beerListService;
    }

    public override void Configure()
    {
        Post("beer-list/enrollment/end");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _beerListService.EndOwnEnrollmentAsync(personId.Value, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}
