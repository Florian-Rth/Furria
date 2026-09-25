using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Management;

public sealed class PutClubContact : Endpoint<PutClubContactRequest>
{
    private readonly ClubRecordService _clubRecordService;

    public PutClubContact(ClubRecordService clubRecordService)
    {
        _clubRecordService = clubRecordService;
    }

    public override void Configure()
    {
        Put("manage/club-record/contact");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(PutClubContactRequest req, CancellationToken ct)
    {
        var result = await _clubRecordService.UpdateContactAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateClubContactCommand ToCommand(PutClubContactRequest req) =>
        new()
        {
            Street = req.Street,
            Zip = req.Zip,
            City = req.City,
            Email = req.Email,
            Phone = req.Phone,
            WebsiteUrl = req.WebsiteUrl,
            InstagramUrl = req.InstagramUrl,
            FacebookUrl = req.FacebookUrl,
        };
}

public sealed record PutClubContactRequest
{
    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required string? Email { get; init; }

    public required string? Phone { get; init; }

    public required string? WebsiteUrl { get; init; }

    public required string? InstagramUrl { get; init; }

    public required string? FacebookUrl { get; init; }
}

public sealed class PutClubContactValidator : Validator<PutClubContactRequest>
{
    private const string NoWebLinkMessage = "Gib eine vollständige Adresse mit https:// ein.";

    public PutClubContactValidator()
    {
        RuleFor(request => request.Street).MaximumLength(ClubRecord.StreetLength);
        RuleFor(request => request.Zip).MaximumLength(ClubRecord.ZipLength);
        RuleFor(request => request.City).MaximumLength(ClubRecord.CityLength);
        RuleFor(request => request.Email)
            .MaximumLength(ClubRecord.EmailLength)
            .EmailAddress()
            .When(request => request.Email is not (null or ""));
        RuleFor(request => request.Phone).MaximumLength(ClubRecord.PhoneLength);
        RuleFor(request => request.WebsiteUrl)
            .MaximumLength(ClubRecord.LinkLength)
            .Must(ClubRecordLimits.IsWebLink)
            .WithMessage(NoWebLinkMessage);
        RuleFor(request => request.InstagramUrl)
            .MaximumLength(ClubRecord.LinkLength)
            .Must(ClubRecordLimits.IsWebLink)
            .WithMessage(NoWebLinkMessage);
        RuleFor(request => request.FacebookUrl)
            .MaximumLength(ClubRecord.LinkLength)
            .Must(ClubRecordLimits.IsWebLink)
            .WithMessage(NoWebLinkMessage);
    }
}
