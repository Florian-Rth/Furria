using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class GetPersonAdoptionCandidate
    : Endpoint<GetPersonAdoptionCandidateRequest, GetPersonAdoptionCandidateResponse>
{
    private readonly PersonAdoptionService _personAdoptionService;

    public GetPersonAdoptionCandidate(PersonAdoptionService personAdoptionService)
    {
        _personAdoptionService = personAdoptionService;
    }

    public override void Configure()
    {
        Get("manage/persons/adoption-candidate");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(
        GetPersonAdoptionCandidateRequest req,
        CancellationToken ct
    )
    {
        var candidate = await _personAdoptionService.GetCandidateAsync(req.Email, ct);
        if (!candidate.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(candidate.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(candidate.Value), cancellation: ct);
    }

    private static GetPersonAdoptionCandidateResponse ToResponse(
        AdoptionCandidateDetails candidate
    ) =>
        new()
        {
            PersonId = candidate.PersonId,
            FirstName = candidate.FirstName,
            LastName = candidate.LastName,
            HasAccount = candidate.HasAccount,
        };
}

public sealed record GetPersonAdoptionCandidateRequest
{
    [QueryParam]
    public required string Email { get; init; }
}

public sealed class GetPersonAdoptionCandidateValidator
    : Validator<GetPersonAdoptionCandidateRequest>
{
    public GetPersonAdoptionCandidateValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(PersonLimits.EmailLength);
    }
}

public sealed record GetPersonAdoptionCandidateResponse
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required bool HasAccount { get; init; }
}
