using FastEndpoints;
using FluentValidation.Results;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Net.Http.Headers;
using Serilog;
using ProblemDetails = Microsoft.AspNetCore.Mvc.ProblemDetails;

namespace Furria.Api.Errors;

public sealed class UnhandledExceptionHandler : IExceptionHandler
{
    private const string UnexpectedTitle = "An unexpected error occurred.";
    private const string UnavailableTitle = "The service is temporarily unavailable.";
    private const string MalformedTitle = "The request could not be read.";
    private const string RetryAfterSeconds = "5";
    private const string ConflictField = "conflict";

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
        if (exception is BadHttpRequestException malformed)
            return AnswerAsync(httpContext, malformed.StatusCode, MalformedTitle);

        _diagnosticContext.SetException(exception);

        if (LostWriteRace.Caused(exception))
            return RefuseAsConflictAsync(httpContext, cancellationToken);

        if (!TransientDatabaseFailure.Caused(exception))
            return AnswerAsync(
                httpContext,
                StatusCodes.Status500InternalServerError,
                UnexpectedTitle
            );

        httpContext.Response.Headers[HeaderNames.RetryAfter] = RetryAfterSeconds;
        return AnswerAsync(httpContext, StatusCodes.Status503ServiceUnavailable, UnavailableTitle);
    }

    private static async ValueTask<bool> RefuseAsConflictAsync(
        HttpContext httpContext,
        CancellationToken ct
    )
    {
        await httpContext.Response.SendErrorsAsync(
            [new ValidationFailure(ConflictField, WriteConflictMessages.ChangedMeanwhile)],
            StatusCodes.Status409Conflict,
            cancellation: ct
        );
        return true;
    }

    private ValueTask<bool> AnswerAsync(HttpContext httpContext, int status, string title)
    {
        httpContext.Response.StatusCode = status;

        return _problemDetails.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails { Status = status, Title = title },
            }
        );
    }
}
