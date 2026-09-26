using Furria.Application.ClubApp;
using Furria.Application.Identity;
using Furria.Application.Mail;
using Furria.Application.PreviewAccess;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services
            .AddOptions<PreviewAccessOptions>()
            .BindConfiguration(PreviewAccessOptions.SectionName);
        services.AddSingleton<PreviewAccessService>();

        services
            .AddOptions<AccessTokenOptions>()
            .BindConfiguration(AccessTokenOptions.SectionName)
            .Validate(
                options =>
                    options.SigningKey.Length >= 32
                    && options.Issuer.Length > 0
                    && options.Audience.Length > 0,
                $"{AccessTokenOptions.SectionName} needs an Issuer, an Audience and a SigningKey "
                    + "of at least 32 characters."
            )
            .ValidateOnStart();

        services
            .AddOptions<RefreshTokenOptions>()
            .BindConfiguration(RefreshTokenOptions.SectionName)
            .Validate(
                options => options.Lifetime > options.ReuseGraceWindow,
                $"{RefreshTokenOptions.SectionName}:Lifetime must exceed ReuseGraceWindow."
            )
            .ValidateOnStart();

        services
            .AddOptions<BootstrapAdminOptions>()
            .BindConfiguration(BootstrapAdminOptions.SectionName);

        services
            .AddOptions<MailOptions>()
            .BindConfiguration(MailOptions.SectionName)
            .Validate(
                options => options.Host.Length > 0 && options.Port > 0 && options.From.Length > 0,
                $"{MailOptions.SectionName} needs a Host, a Port and a From address."
            )
            .ValidateOnStart();

        services
            .AddOptions<ClubAppOptions>()
            .BindConfiguration(ClubAppOptions.SectionName)
            .Configure<IConfiguration>(
                (options, configuration) =>
                    options.AndroidCertFingerprints = AndroidCertFingerprintsOf(configuration)
            )
            .Validate(
                options => IsAbsoluteWebUrl(options.BaseUrl),
                $"{ClubAppOptions.SectionName}:BaseUrl must be an absolute http(s) URL."
            )
            .Validate(
                options =>
                    options.AndroidCertFingerprints.All(fingerprint =>
                        AndroidCertFingerprint.BytesOf(fingerprint) is not null
                    ),
                $"{ClubAppOptions.SectionName}:AndroidCertFingerprints must be SHA-256 fingerprints "
                    + "in the colon-separated hex form keytool prints."
            )
            .ValidateOnStart();

        return services;
    }

    private static string[] AndroidCertFingerprintsOf(IConfiguration configuration)
    {
        var section = configuration
            .GetSection(ClubAppOptions.SectionName)
            .GetSection(nameof(ClubAppOptions.AndroidCertFingerprints));

        return AndroidCertFingerprint.ListOf(
            [section.Value, .. section.GetChildren().Select(entry => entry.Value)]
        );
    }

    private static bool IsAbsoluteWebUrl(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp);
}
