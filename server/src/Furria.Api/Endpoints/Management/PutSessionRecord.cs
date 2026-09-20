using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Management;

public sealed class PutSessionRecord : Endpoint<PutSessionRecordRequest>
{
    private readonly SessionRecordService _sessionRecordService;

    public PutSessionRecord(SessionRecordService sessionRecordService)
    {
        _sessionRecordService = sessionRecordService;
    }

    public override void Configure()
    {
        Put("manage/sessions/{sessionId}");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(PutSessionRecordRequest req, CancellationToken ct)
    {
        var result = await _sessionRecordService.UpdateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateSessionRecordCommand ToCommand(PutSessionRecordRequest req) =>
        new()
        {
            SessionId = req.SessionId,
            StartYear = req.StartYear,
            Number = req.Number,
            Motto = req.Motto,
            LogoSvg = req.LogoSvg,
        };
}

public sealed record PutSessionRecordRequest
{
    [RouteParam]
    public required int SessionId { get; init; }

    public required int StartYear { get; init; }

    public required int? Number { get; init; }

    public required string? Motto { get; init; }

    public required string? LogoSvg { get; init; }
}

public sealed class PutSessionRecordValidator : Validator<PutSessionRecordRequest>
{
    public PutSessionRecordValidator()
    {
        RuleFor(request => request.SessionId).GreaterThan(0);
        RuleFor(request => request.StartYear)
            .InclusiveBetween(
                SessionRecordLimits.EarliestStartYear,
                SessionRecordLimits.LatestStartYear
            );
        RuleFor(request => request.Number)
            .GreaterThan(0)
            .When(request => request.Number is not null);
        RuleFor(request => request.Motto).MaximumLength(SessionRecordLimits.MottoLength);
        RuleFor(request => request.LogoSvg).MaximumLength(SessionRecordLimits.LogoSvgLength);
    }
}
