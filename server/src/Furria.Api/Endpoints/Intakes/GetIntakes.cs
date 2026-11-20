using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Intakes;
using Furria.Core.Intakes;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Endpoints.Intakes;

public sealed class GetIntakes : EndpointWithoutRequest<GetIntakesResponse>
{
    private readonly IntakeService _intakeService;

    public GetIntakes(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    public override void Configure()
    {
        Get("intakes");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _intakeService.GetIntakesAsync(accountId.Value, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetIntakesResponse { Intakes = [.. result.Value.Select(ToDto)] },
            cancellation: ct
        );
    }

    private static GetIntakesIntakeDto ToDto(IntakeSummary intake) =>
        new()
        {
            IntakeId = intake.IntakeId,
            State = intake.State,
            Label = intake.Label,
            Newcomer = ToDto(intake.Newcomer),
            MemberFrom = intake.MemberFrom,
            Groups =
            [
                .. intake.Groups.Select(group => new GetIntakesGroupDto
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

    private static GetIntakesPersonDto? ToDto(IntakePersonName? person) =>
        person is null
            ? null
            : new()
            {
                PersonId = person.PersonId,
                FirstName = person.FirstName,
                LastName = person.LastName,
            };
}

public sealed record GetIntakesResponse
{
    public required IReadOnlyList<GetIntakesIntakeDto> Intakes { get; init; }
}

public sealed record GetIntakesIntakeDto
{
    public required int IntakeId { get; init; }

    public required IntakeState State { get; init; }

    public required string? Label { get; init; }

    public required GetIntakesPersonDto? Newcomer { get; init; }

    public required DateOnly? MemberFrom { get; init; }

    public required IReadOnlyList<GetIntakesGroupDto> Groups { get; init; }

    public required GetIntakesPersonDto? StartedBy { get; init; }

    public required bool CanManage { get; init; }

    public required DateTimeOffset CreatedAt { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }

    public required DateTimeOffset? SubmittedAt { get; init; }

    public required DateTimeOffset? CompletedAt { get; init; }

    public required DateTimeOffset? DiscardedAt { get; init; }
}

public sealed record GetIntakesGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }
}

public sealed record GetIntakesPersonDto
{
    public required int? PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}
