using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace Furria.Api.Errors;

public sealed class UnhandledExceptionHandler : IExceptionHandler
{
    private const string Title = "An unexpected error occurred.";

    private readonly IDiagnosticContext _diagnosticContext;
    private readonly IProblemDetailsService _problemDetails;

    public UnhandledExceptionHandler(
        IDiagnosticContext diagnosticContext,
        IProblemDetailsService problemDetails
    )
    {
        _diagnosticContext = diagnosticContext;
        _problemDetails = problemDetails;
    }

    public ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken
    )
    {
        _diagnosticContext.SetException(exception);
        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        return _problemDetails.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status500InternalServerError,
                    Title = Title,
                },
            }
        );
    }
}
