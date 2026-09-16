using FastEndpoints;
using FluentValidation.Results;
using Furria.Application.Results;

namespace Furria.Api.Results;

public static class ResultResponseExtensions
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int ConflictStatusCode = 409;
    private const int ValidationStatusCode = 422;

    public static Task SendFailureAsync(
        this HttpResponse response,
        ResultError error,
        CancellationToken ct
    ) =>
        error.Kind switch
        {
            ResultErrorKind.NotFound => response.SendNotFoundAsync(ct),
            ResultErrorKind.Conflict => SendSingleFailureAsync(
                response,
                ConflictField,
                error.Message,
                ConflictStatusCode,
                ct
            ),
            ResultErrorKind.Validation => SendSingleFailureAsync(
                response,
                ValidationField,
                error.Message,
                ValidationStatusCode,
                ct
            ),
            ResultErrorKind.Forbidden => response.SendForbiddenAsync(ct),
            ResultErrorKind.Unauthorized => response.SendUnauthorizedAsync(ct),
            _ => throw new ArgumentOutOfRangeException(
                nameof(error),
                error.Kind,
                "No HTTP status is defined for this result error kind."
            ),
        };

    private static Task SendSingleFailureAsync(
        HttpResponse response,
        string field,
        string message,
        int statusCode,
        CancellationToken ct
    ) =>
        response.SendErrorsAsync(
            [new ValidationFailure(field, message)],
            statusCode,
            cancellation: ct
        );
}
