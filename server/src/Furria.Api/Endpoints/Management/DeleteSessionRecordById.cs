using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Management;

public sealed class DeleteSessionRecordById : Endpoint<DeleteSessionRecordByIdRequest>
{
    private readonly SessionRecordService _sessionRecordService;

    public DeleteSessionRecordById(SessionRecordService sessionRecordService)
    {
        _sessionRecordService = sessionRecordService;
    }

    public override void Configure()
    {
        Delete("manage/sessions/{sessionId}");
        Definition.RequirePermission(FurriaPermissions.ClubManage);
    }

    public override async Task HandleAsync(DeleteSessionRecordByIdRequest req, CancellationToken ct)
    {
        var result = await _sessionRecordService.DeleteAsync(req.SessionId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteSessionRecordByIdRequest
{
    [RouteParam]
    public required int SessionId { get; init; }
}

public sealed class DeleteSessionRecordByIdValidator : Validator<DeleteSessionRecordByIdRequest>
{
    public DeleteSessionRecordByIdValidator()
    {
        RuleFor(request => request.SessionId).GreaterThan(0);
    }
}
