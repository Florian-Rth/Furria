namespace Furria.Application.Intakes;

public sealed record IntakeDetails
{
    public required IntakeSummary Intake { get; init; }

    public required string? Token { get; init; }

    public required IntakeReviewDetails? Review { get; init; }
}
