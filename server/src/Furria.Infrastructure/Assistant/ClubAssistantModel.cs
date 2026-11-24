using System.ClientModel;
using Furria.Application.Assistant;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using OpenAI;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantModel
{
    public static IServiceCollection AddClubAssistant(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddScoped<ClubAssistantBudget>();
        services.AddScoped<ClubAssistantService>();
        services.AddScoped<ClubAssistantReplies>();
        services.AddScoped<ClubAssistantNotices>();
        services.AddScoped<ClubAssistantConversations>();
        services.AddScoped<ClubAssistantReception>();

        var options = configuration
            .GetSection(ClubAssistantOptions.SectionName)
            .Get<ClubAssistantOptions>();
        if (options is { IsConfigured: true })
            services.AddChatClient(serviceProvider =>
                Connect(serviceProvider.GetRequiredService<IOptions<ClubAssistantOptions>>().Value)
            );

        return services;
    }

    private static IChatClient Connect(ClubAssistantOptions options) =>
        new OpenAIClient(
            new ApiKeyCredential(options.ApiKey),
            new OpenAIClientOptions { Endpoint = new Uri(options.Endpoint) }
        )
            .GetChatClient(options.Model)
            .AsIChatClient();
}
