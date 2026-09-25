namespace Furria.Application.Mail;

public sealed class MailOptions
{
    public const string SectionName = "Mail";

    public string Host { get; set; } = "";

    public int Port { get; set; } = 587;

    public string User { get; set; } = "";

    public string Password { get; set; } = "";

    public string From { get; set; } = "";
}
