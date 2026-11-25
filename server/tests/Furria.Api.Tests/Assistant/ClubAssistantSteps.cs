using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WhatsApp;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.WhatsApp.WebhookDeliveries;

namespace Furria.Api.Tests.Assistant;

internal static class ClubAssistantSteps
{
    internal static string Iso(DateOnly day) => day.ToString("yyyy-MM-dd");

    internal static async Task AskAsync(
        ApiTestFixture fixture,
        string chatId,
        string text,
        CancellationToken ct
    )
    {
        var now = fixture.TimeProvider.GetUtcNow();
        var client = fixture.CreateClient();
        var received = await DeliverAsync(
            client,
            Message(chatId, text, now.AddSeconds(-20)),
            $"message-{Guid.NewGuid():N}",
            ct
        );
        Assert.Equal(HttpStatusCode.OK, received.StatusCode);
        await fixture.WhatsAppInboxDrainedAsync(ct);
        await fixture.ClubAssistantAnsweredAsync(ct);
        await fixture.WhatsAppOutboxDrainedAsync(ct);
        fixture.TimeProvider.SetUtcNow(now.AddMinutes(1));
    }

    internal static async Task SwitchOnAsync(SeededContext ctx, CancellationToken ct)
    {
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutClubAssistant, PutClubAssistantRequest>(
            new()
            {
                IsEnabled = true,
                MonthlyBudgetEuros = 10m,
                QuestionsPerPersonPerDay = 30,
            }
        );
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
