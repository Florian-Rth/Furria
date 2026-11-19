using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Intakes;
using Furria.Core.Intakes;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Endpoints.Intakes;

public sealed class GetIntakeById : Endpoint<GetIntakeByIdRequest, GetIntakeByIdResponse>
{
    private readonly IntakeService _intakeService;

    public GetIntakeById(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    public override void Configure()
    {
        Get("intakes/{intakeId}");
    }

    public override async Task HandleAsync(GetIntakeByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _intakeService.GetIntakeAsync(accountId.Value, req.IntakeId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetIntakeByIdResponse
            {
                Intake = ToDto(result.Value.Intake),
                Token = result.Value.Token,
            },
            cancellation: ct
        );
    }

    private static GetIntakeByIdIntakeDto ToDto(IntakeSummary intake) =>
        new()
        {
            IntakeId = intake.IntakeId,
            State = intake.State,
            Label = intake.Label,
            Newcomer = ToDto(intake.Newcomer),
            MemberFrom = intake.MemberFrom,
            Groups =
            [
                .. intake.Groups.Select(group => new GetIntakeByIdGroupDto
                {
                    GroupId = group.GroupId,
                    Name = group.Name,
                }),
            ],
            StartedBy = ToDto(intake.StartedBy),
            CanManage = intake.CanManage,
            CreatedAt = intake.CreatedAt,
            ExpiresAt = intake.ExpiresAt,
            SubmittedAt = intake.SubmittedAt,
            CompletedAt = intake.CompletedAt,
            DiscardedAt = intake.DiscardedAt,
        };

    private static GetIntakeByIdPersonDto? ToDto(IntakePersonName? person) =>
        person is null
            ? null
            : new()
            {
                PersonId = person.PersonId,
                FirstName = person.FirstName,
                LastName = person.LastName,
            };
}

public sealed record GetIntakeByIdRequest
{
    [RouteParam]
    public required int IntakeId { get; init; }
}

public sealed class GetIntakeByIdValidator : Validator<GetIntakeByIdRequest>
{
    public GetIntakeByIdValidator()
    {
        RuleFor(request => request.IntakeId).GreaterThan(0);
    }
}

public sealed record GetIntakeByIdResponse
{
    public required GetIntakeByIdIntakeDto Intake { get; init; }

    public required string? Token { get; init; }
}

public sealed record GetIntakeByIdIntakeDto
{
    public required int IntakeId { get; init; }

    public required IntakeState State { get; init; }

    public required string? Label { get; init; }

    public required GetIntakeByIdPersonDto? Newcomer { get; init; }

    public required DateOnly? MemberFrom { get; init; }

    public required IReadOnlyList<GetIntakeByIdGroupDto> Groups { get; init; }

    public required GetIntakeByIdPersonDto? StartedBy { get; init; }

    public required bool CanManage { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }

    public required DateTimeOffset? SubmittedAt { get; init; }

    public required DateTimeOffset? CompletedAt { get; init; }

    public required DateTimeOffset? DiscardedAt { get; init; }
}

public sealed record GetIntakeByIdGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }
}

public sealed record GetIntakeByIdPersonDto
{
    public required int? PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
