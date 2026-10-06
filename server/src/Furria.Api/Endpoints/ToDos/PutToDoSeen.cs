using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Management;
using Furria.Infrastructure.Management;

namespace Furria.Api.Endpoints.ToDos;

public sealed class PutToDoSeen : Endpoint<PutToDoSeenRequest>
{
    private readonly ToDoService _toDoService;

    public PutToDoSeen(ToDoService toDoService)
    {
        _toDoService = toDoService;
    }

    public override void Configure()
    {
        Put("to-dos/{kind}/seen");
        Definition.RequireAnyPermission(ToDoKeys.All);
    }

    public override async Task HandleAsync(PutToDoSeenRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _toDoService.MarkSeenAsync(ToCommand(accountId.Value, req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static ToDoMarkCommand ToCommand(int accountId, PutToDoSeenRequest req) =>
        new()
        {
            AccountId = accountId,
            Kind = req.Kind,
            Version = req.Version,
        };
}

public sealed record PutToDoSeenRequest
{
    [RouteParam]
    public required ToDoKind Kind { get; init; }

    public required string Version { get; init; }
}

public sealed class PutToDoSeenValidator : Validator<PutToDoSeenRequest>
{
    private const int VersionLength = 64;

    public PutToDoSeenValidator()
    {
        RuleFor(request => request.Kind).IsInEnum();
        RuleFor(request => request.Version).NotEmpty().MaximumLength(VersionLength);
    }
}
