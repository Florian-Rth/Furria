namespace Furria.Api.Altcha;

public sealed record AltchaPayload
{
    public required AltchaChallenge Challenge { get; init; }

    public required AltchaSolution Solution { get; init; }
}
