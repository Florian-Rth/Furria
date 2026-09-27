using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Management;

public sealed class PutClubAccess : Endpoint<PutClubAccessRequest>
{
    private readonly ClubRecordService _clubRecordService;

    public PutClubAccess(ClubRecordService clubRecordService)
    {
        _clubRecordService = clubRecordService;
    }

    public override void Configure()
    {
        Put("manage/club-record/access");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(PutClubAccessRequest req, CancellationToken ct)
    {
        var result = await _clubRecordService.UpdateAccessAsync(req.AgeOfConsent, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutClubAccessRequest
{
    public required int AgeOfConsent { get; init; }
}

public sealed class PutClubAccessValidator : Validator<PutClubAccessRequest>
{
    private const string AgeOfConsentOutOfRangeMessage =
        "Das Mindestalter liegt zwischen 12 und 21 Jahren.";

    public PutClubAccessValidator()
    {
        RuleFor(request => request.AgeOfConsent)
            .InclusiveBetween(
                ClubRecordLimits.YoungestAgeOfConsent,
                ClubRecordLimits.OldestAgeOfConsent
            )
            .WithMessage(AgeOfConsentOutOfRangeMessage);
    }
}
