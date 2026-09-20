using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Management;

public sealed class PostSessionRecord
    : Endpoint<PostSessionRecordRequest, PostSessionRecordResponse>
{
    private readonly SessionRecordService _sessionRecordService;

    public PostSessionRecord(SessionRecordService sessionRecordService)
    {
        _sessionRecordService = sessionRecordService;
    }

    public override void Configure()
    {
        Post("manage/sessions");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(PostSessionRecordRequest req, CancellationToken ct)
    {
        var result = await _sessionRecordService.CreateAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static CreateSessionRecordCommand ToCommand(PostSessionRecordRequest req) =>
        new()
        {
            StartYear = req.StartYear,
            Number = req.Number,
            Motto = req.Motto,
            LogoSvg = req.LogoSvg,
        };

    private static PostSessionRecordResponse ToResponse(int sessionId) =>
        new() { SessionId = sessionId };
}

public sealed record PostSessionRecordRequest
{
    public required int StartYear { get; init; }

    public required int? Number { get; init; }

    public required string? Motto { get; init; }

    public required string? LogoSvg { get; init; }
}

public sealed class PostSessionRecordValidator : Validator<PostSessionRecordRequest>
{
    public PostSessionRecordValidator()
    {
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

public sealed record PostSessionRecordResponse
{
    public required int SessionId { get; init; }
}
