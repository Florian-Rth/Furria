using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Assistant;
using Furria.Application.Authorization;
using Furria.Infrastructure.Assistant;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class GetClubAssistant : EndpointWithoutRequest<GetClubAssistantResponse>
{
    private readonly ClubAssistantService _assistant;

    public GetClubAssistant(ClubAssistantService assistant)
    {
        _assistant = assistant;
    }

    public override void Configure()
    {
        Get("system/whatsapp/assistant");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var details = await _assistant.GetAsync(ct);

        await Send.OkAsync(ToResponse(details), cancellation: ct);
    }

    private static GetClubAssistantResponse ToResponse(ClubAssistantDetails details) =>
        new()
        {
            IsEnabled = details.IsEnabled,
            MonthlyBudgetEuros = details.MonthlyBudgetEuros,
            QuestionsPerPersonPerDay = details.QuestionsPerPersonPerDay,
            UsedThisMonthEuros = details.UsedThisMonthEuros,
            IsModelConfigured = details.IsModelConfigured,
        };
}

public sealed record GetClubAssistantResponse
{
    public required bool IsEnabled { get; init; }

    public required decimal MonthlyBudgetEuros { get; init; }

    public required int QuestionsPerPersonPerDay { get; init; }

    public required decimal UsedThisMonthEuros { get; init; }

    public required bool IsModelConfigured { get; init; }
}
