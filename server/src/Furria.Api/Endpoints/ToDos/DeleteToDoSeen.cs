using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Management;
using Furria.Infrastructure.Management;

namespace Furria.Api.Endpoints.ToDos;

public sealed class DeleteToDoSeen : Endpoint<DeleteToDoSeenRequest>
{
    private readonly ToDoService _toDoService;

    public DeleteToDoSeen(ToDoService toDoService)
    {
        _toDoService = toDoService;
    }

    public override void Configure()
    {
        Delete("to-dos/{kind}/seen");
        Definition.RequireAnyPermission(ToDoKeys.All);
    }

    public override async Task HandleAsync(DeleteToDoSeenRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        await _toDoService.UnmarkSeenAsync(accountId.Value, req.Kind, ct);

        await Send.NoContentAsync(ct);
    }
}

public sealed record DeleteToDoSeenRequest
{
    [RouteParam]
    public required ToDoKind Kind { get; init; }
}

public sealed class DeleteToDoSeenValidator : Validator<DeleteToDoSeenRequest>
{
    public DeleteToDoSeenValidator()
    {
        RuleFor(request => request.Kind).IsInEnum();
    }
}
