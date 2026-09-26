using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class SignedOutMailRequestWorker : BackgroundService
{
    private readonly SignedOutMailRequestQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SignedOutMailRequestWorker> _logger;

    public SignedOutMailRequestWorker(
        SignedOutMailRequestQueue queue,
        IServiceScopeFactory scopeFactory,
        ILogger<SignedOutMailRequestWorker> logger
    )
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var request in _queue.ReadAllAsync(stoppingToken))
            await AnswerAsync(request, stoppingToken);
    }

    private async Task AnswerAsync(SignedOutMailRequest request, CancellationToken ct)
    {
        try
        {
            await using var scope = _scopeFactory.CreateAsyncScope();
            await AnswerInScopeAsync(scope.ServiceProvider, request, ct);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(
                "Signed-out request {SignedOutRequestKind} failed with {FailureType}",
                request.Kind,
                exception.GetType().Name
            );
        }
    }

    private static Task AnswerInScopeAsync(
        IServiceProvider services,
        SignedOutMailRequest request,
        CancellationToken ct
    ) =>
        request.Kind switch
        {
            SignedOutMailRequestKind.AccessRequest => services
                .GetRequiredService<AccessRequestService>()
                .AnswerAsync(request.Email, ct),
            SignedOutMailRequestKind.PasswordReset => services
                .GetRequiredService<PasswordResetService>()
                .AnswerRequestAsync(request.Email, ct),
            _ => throw new ArgumentOutOfRangeException(nameof(request), request.Kind, null),
        };
}
