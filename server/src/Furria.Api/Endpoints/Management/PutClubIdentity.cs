using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Management;

public sealed class PutClubIdentity : Endpoint<PutClubIdentityRequest>
{
    private readonly ClubRecordService _clubRecordService;

    public PutClubIdentity(ClubRecordService clubRecordService)
    {
        _clubRecordService = clubRecordService;
    }

    public override void Configure()
    {
        Put("manage/club-record/identity");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(PutClubIdentityRequest req, CancellationToken ct)
    {
        var result = await _clubRecordService.UpdateIdentityAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateClubIdentityCommand ToCommand(PutClubIdentityRequest req) =>
        new()
        {
            Name = req.Name,
            ShortName = req.ShortName,
            FoundedYear = req.FoundedYear,
        };
}

public sealed record PutClubIdentityRequest
{
    public required string? Name { get; init; }

    public required string? ShortName { get; init; }

    public required int? FoundedYear { get; init; }
}

public sealed class PutClubIdentityValidator : Validator<PutClubIdentityRequest>
{
    private const string FoundedYearOutOfRangeMessage =
        "Das Gründungsjahr liegt zwischen 1800 und 2100.";

    public PutClubIdentityValidator()
    {
        RuleFor(request => request.Name).MaximumLength(ClubRecord.NameLength);
        RuleFor(request => request.ShortName).MaximumLength(ClubRecord.ShortNameLength);
        RuleFor(request => request.FoundedYear)
            .InclusiveBetween(
                ClubRecordLimits.EarliestFoundedYear,
                ClubRecordLimits.LatestFoundedYear
            )
            .WithMessage(FoundedYearOutOfRangeMessage)
            .When(request => request.FoundedYear is not null);
    }
}
