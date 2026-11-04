using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.BeerList;

namespace Furria.Api.Endpoints.BeerList;

public sealed class PostMyBeerListEnrollment : Endpoint<PostMyBeerListEnrollmentRequest>
{
    private readonly BeerListService _beerListService;

    public PostMyBeerListEnrollment(BeerListService beerListService)
    {
        _beerListService = beerListService;
    }

    public override void Configure()
    {
        Post("beer-list/enrollment");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(
        PostMyBeerListEnrollmentRequest req,
        CancellationToken ct
    )
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _beerListService.EnrollAsync(personId.Value, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PostMyBeerListEnrollmentRequest
{
    public required bool ConfirmsDeclaration { get; init; }
}

public sealed class PostMyBeerListEnrollmentValidator : Validator<PostMyBeerListEnrollmentRequest>
{
    private const string UnconfirmedMessage =
        "Bestätige die Erklärung, um dich auf die Bierliste zu setzen.";

    public PostMyBeerListEnrollmentValidator()
    {
        RuleFor(request => request.ConfirmsDeclaration).Equal(true).WithMessage(UnconfirmedMessage);
    }
}
