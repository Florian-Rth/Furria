using System.ClientModel;
using System.ClientModel.Primitives;
using Furria.Application.Assistant;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using OpenAI;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantModel
{
    public const string HttpClientName = "ClubAssistantModel";

    private static readonly TimeSpan PooledConnectionLifetime = TimeSpan.FromMinutes(15);

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
        services.AddScoped<ClubAssistantAskers>();
        services.AddScoped<ClubAssistantTools>();
        services.AddScoped<ClubAssistantDialogue>();
        services.AddScoped<ClubAssistantAnswers>();
        services.AddHostedService<ClubAssistantAnswerWorker>();
        services
            .AddHttpClient(HttpClientName)
            .ConfigurePrimaryHttpMessageHandler(() =>
                new SocketsHttpHandler { PooledConnectionLifetime = PooledConnectionLifetime }
            );

        var options = configuration
            .GetSection(ClubAssistantOptions.SectionName)
            .Get<ClubAssistantOptions>();
        if (options is { IsConfigured: true })
            services.AddChatClient(serviceProvider =>
                Connect(
                    serviceProvider.GetRequiredService<IOptions<ClubAssistantOptions>>().Value,
                    serviceProvider
                        .GetRequiredService<IHttpClientFactory>()
                        .CreateClient(HttpClientName)
                )
            );

        return services;
    }

    private static IChatClient Connect(ClubAssistantOptions options, HttpClient http) =>
        new OpenAIClient(
            new ApiKeyCredential(options.ApiKey),
            new OpenAIClientOptions
            {
                Endpoint = new Uri(options.Endpoint),
                Transport = new HttpClientPipelineTransport(http),
                NetworkTimeout = Timeout.InfiniteTimeSpan,
                RetryPolicy = new ClientRetryPolicy(maxRetries: 0),
            }
        ).GetChatClient(options.Model).AsIChatClient();
}
