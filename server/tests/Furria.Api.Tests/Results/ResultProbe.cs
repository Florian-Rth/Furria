using FastEndpoints;
using FluentValidation;
using Furria.Api.Results;
using Furria.Application.Results;

namespace Furria.Api.Tests.Results;

public sealed class ResultProbe : Endpoint<ResultProbeRequest>
{
    public const string FailureMessage = "Die Ruhezeit liegt ausserhalb der Mitgliedschaft.";

    public override void Configure()
    {
        Post("tests/result-probe");
        AllowAnonymous();
    }

    public override async Task HandleAsync(ResultProbeRequest req, CancellationToken ct)
    {
        var result = Produce(req.Kind);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static Result Produce(ResultErrorKind? kind) =>
        kind switch
        {
            ResultErrorKind.NotFound => Result.NotFound(FailureMessage),
            ResultErrorKind.Conflict => Result.Conflict(FailureMessage),
            ResultErrorKind.Validation => Result.Validation(FailureMessage),
            ResultErrorKind.Forbidden => Result.Forbidden(FailureMessage),
            ResultErrorKind.Unauthorized => Result.Unauthorized(FailureMessage),
            _ => Result.Success(),
        };
}

public sealed record ResultProbeRequest
{
    public required ResultErrorKind? Kind { get; init; }
}

public sealed class ResultProbeValidator : Validator<ResultProbeRequest>
{
    public ResultProbeValidator()
    {
        RuleFor(request => request.Kind).IsInEnum();
    }
}
