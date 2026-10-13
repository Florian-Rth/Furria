using FastEndpoints;
using Microsoft.AspNetCore.Http;

namespace Furria.Api.Tests.Errors;

public sealed class BadRequestProbe : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("tests/bad-request-probe");
        AllowAnonymous();
    }

    public override Task HandleAsync(CancellationToken ct) =>
        throw new BadHttpRequestException(
            "The request body is too large.",
            StatusCodes.Status413PayloadTooLarge
        );
}
