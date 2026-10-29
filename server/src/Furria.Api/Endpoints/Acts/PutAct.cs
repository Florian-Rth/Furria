using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutAct : Endpoint<PutActRequest>
{
    private readonly ActService _actService;
    private readonly ActAccess _actAccess;

    public PutAct(ActService actService, ActAccess actAccess)
    {
        _actService = actService;
        _actAccess = actAccess;
    }

    public override void Configure()
    {
        Put("acts/{actId}");
    }

    public override async Task HandleAsync(PutActRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var scope = await _actAccess.ScopeOfAsync(accountId.Value, ct);
        if (scope is null)
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _actService.UpdateAsync(scope, ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateActCommand ToCommand(PutActRequest req) =>
        new()
        {
            ActId = req.ActId,
            Facts = new ActFactsCommand
            {
                Name = req.Name,
                GroupId = req.GroupId,
                Kind = req.Kind,
                AddedPersonIds = req.AddedPersonIds,
                RemovedPersonIds = req.RemovedPersonIds,
                Wishes = [.. req.Wishes.Select(wish => wish.ToInput())],
            },
        };
}

public sealed record PutActRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required int? GroupId { get; init; }

    public required ActKind? Kind { get; init; }

    public required IReadOnlyList<int> AddedPersonIds { get; init; }

    public required IReadOnlyList<int> RemovedPersonIds { get; init; }

    public required IReadOnlyList<ActWishDataDto> Wishes { get; init; }
}

public sealed class PutActValidator : Validator<PutActRequest>
{
    public PutActValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.Name)
            .Must(name => !string.IsNullOrWhiteSpace(name))
            .WithMessage(ActLimits.NameMissingMessage)
            .MaximumLength(ActLimits.NameLength);
        RuleFor(request => request.AddedPersonIds)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(personIds => personIds.Count <= ActLimits.MostPersons);
        RuleFor(request => request.RemovedPersonIds)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(personIds => personIds.Count <= ActLimits.MostPersons);
        RuleFor(request => request.Wishes).NotNull();
    }
}
