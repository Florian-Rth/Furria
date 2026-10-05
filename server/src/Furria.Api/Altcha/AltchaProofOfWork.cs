using Microsoft.Extensions.Options;

namespace Furria.Api.Altcha;

public static class AltchaProofOfWork
{
    public static IServiceCollection AddAltchaProofOfWork(this IServiceCollection services)
    {
        services
            .AddOptions<AltchaOptions>()
            .BindConfiguration(AltchaOptions.SectionName)
            .Validate(
                options => options.HmacKey.Length >= AltchaOptions.MinimumHmacKeyLength,
                $"{AltchaOptions.SectionName}:HmacKey needs at least "
                    + $"{AltchaOptions.MinimumHmacKeyLength} characters."
            )
            .Validate(
                options =>
                    options.Cost > 0
                    && options.MinCounter >= 0
                    && options.MaxCounter >= options.MinCounter,
                $"{AltchaOptions.SectionName} needs a positive Cost and a MinCounter no greater "
                    + "than MaxCounter."
            )
            .ValidateOnStart();

        services.AddSingleton<SpentAltchaChallenges>();
        return services.AddSingleton<AltchaChallenges>();
    }
}
