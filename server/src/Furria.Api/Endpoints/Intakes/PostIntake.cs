using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Intakes;
using Furria.Core.Intakes;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Endpoints.Intakes;

public sealed class PostIntake : Endpoint<PostIntakeRequest, PostIntakeResponse>
{
    private readonly IntakeService _intakeService;

    public PostIntake(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    public override void Configure()
    {
        Post("intakes");
    }

    public override async Task HandleAsync(PostIntakeRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _intakeService.StartAsync(ToCommand(req, accountId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static StartIntakeCommand ToCommand(PostIntakeRequest req, int accountId) =>
        new()
        {
            ActorAccountId = accountId,
            MemberFrom = req.MemberFrom,
            GroupIds = req.GroupIds,
            Label = req.Label,
        };

    private static PostIntakeResponse ToResponse(IntakeLinkDetails link) =>
        new()
        {
            IntakeId = link.IntakeId,
            Token = link.Token,
            ExpiresAt = link.ExpiresAt,
        };
}

public sealed record PostIntakeRequest
{
    public required DateOnly? MemberFrom { get; init; }

    public required IReadOnlyList<int> GroupIds { get; init; }

    public string? Label { get; init; }
}

public sealed class PostIntakeValidator : Validator<PostIntakeRequest>
{
    public PostIntakeValidator()
    {
        RuleForEach(request => request.GroupIds).GreaterThan(0);
        RuleFor(request => request.GroupIds)
            .NotNull()
            .Must(groupIds => groupIds is null || groupIds.Distinct().Count() == groupIds.Count);
        RuleFor(request => request.Label).MaximumLength(Intake.LabelLength);
    }
}

public sealed record PostIntakeResponse
{
    public required int IntakeId { get; init; }

    public required string Token { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
