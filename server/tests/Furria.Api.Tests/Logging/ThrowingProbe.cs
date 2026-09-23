using FastEndpoints;

namespace Furria.Api.Tests.Logging;

public sealed class ThrowingProbe : EndpointWithoutRequest
{
    public const string FailureMessage = "The throwing probe failed on purpose.";

    public override void Configure()
    {
        Get("tests/throwing-probe");
        AllowAnonymous();
    }

    public override Task HandleAsync(CancellationToken ct) =>
        throw new InvalidOperationException(FailureMessage);
}
