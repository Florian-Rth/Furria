using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Assistant;
using Furria.Application.Authorization;
using Furria.Core.Assistant;
using Furria.Infrastructure.Assistant;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class PutClubAssistant : Endpoint<PutClubAssistantRequest>
{
    private readonly ClubAssistantService _assistant;

    public PutClubAssistant(ClubAssistantService assistant)
    {
        _assistant = assistant;
    }

    public override void Configure()
    {
        Put("system/whatsapp/assistant");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(PutClubAssistantRequest req, CancellationToken ct)
    {
        var updated = await _assistant.UpdateAsync(
            new UpdateClubAssistantCommand(
                req.IsEnabled,
                req.MonthlyBudgetEuros,
                req.QuestionsPerPersonPerDay
            ),
            ct
        );
        if (!updated.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(updated.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutClubAssistantRequest
{
    public required bool IsEnabled { get; init; }

    public required decimal MonthlyBudgetEuros { get; init; }

    public required int QuestionsPerPersonPerDay { get; init; }
}

public sealed class PutClubAssistantValidator : Validator<PutClubAssistantRequest>
{
    public PutClubAssistantValidator()
    {
        RuleFor(request => request.MonthlyBudgetEuros)
            .InclusiveBetween(0, ClubAssistantSettings.LargestMonthlyBudgetEuros)
            .PrecisionScale(
                ClubAssistantSettings.BudgetPrecision,
                ClubAssistantSettings.BudgetScale,
                true
            );
        RuleFor(request => request.QuestionsPerPersonPerDay)
            .InclusiveBetween(1, ClubAssistantSettings.MostQuestionsPerPersonPerDay);
    }
}
