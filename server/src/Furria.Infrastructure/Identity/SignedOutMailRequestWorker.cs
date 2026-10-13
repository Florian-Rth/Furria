using Furria.Application.Operations;
using Furria.Infrastructure.Operations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Furria.Infrastructure.Identity;

public sealed class SignedOutMailRequestWorker : BackgroundService
{
    private readonly SignedOutMailRequestQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BackgroundRuns _runs;
    private readonly ILogger<SignedOutMailRequestWorker> _logger;

    public SignedOutMailRequestWorker(
        SignedOutMailRequestQueue queue,
        IServiceScopeFactory scopeFactory,
        BackgroundRuns runs,
        ILogger<SignedOutMailRequestWorker> logger
    )
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _runs = runs;
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
            await _runs.TrackAsync(
                BackgroundJob.SignedOutMailRequestWorker,
                () => AnswerInScopeAsync(request, ct)
            );
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            _logger.LogError(
                "Signed-out request {SignedOutRequestKind} failed with {FailureType}",
                request.Kind,
                exception.GetType().Name
            );
        }
        finally
        {
            _queue.MarkAnswered();
        }
    }

    private async Task AnswerInScopeAsync(SignedOutMailRequest request, CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        await AnswerWithAsync(scope.ServiceProvider, request, ct);
    }

    private static Task AnswerWithAsync(
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
