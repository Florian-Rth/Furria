namespace Furria.Infrastructure.Persistence;

public static class WriteConflictMessages
{
    public const string OpenMitgliedschaft = "Es läuft bereits eine Mitgliedschaft.";
    public const string OpenZugehoerigkeit = "Diese Person gehört der Gruppe bereits an.";
    public const string OpenErnennung = "Diese Person ist bereits Gruppen-Admin dieser Gruppe.";
    public const string OpenInhaberschaft = "Diese Person hat diese Rolle bereits inne.";
    public const string DuplicateGruppenName = "Eine Gruppe mit diesem Namen gibt es schon.";
    public const string DuplicateRollenName = "Eine Rolle mit diesem Namen gibt es schon.";
    public const string DuplicateOrt = "Diesen Ort gibt es schon.";
    public const string DuplicateVorstandsfunktion = "Diese Vorstandsfunktion gibt es schon.";
    public const string DuplicateZusage = "Für diesen Eintrag ist schon eine Antwort gespeichert.";
    public const string DuplicateGruppenart = "Diese Gruppenart gibt es schon.";
    public const string DuplicateMitwirkung = "Diese Gruppe wirkt bei diesem Eintrag schon mit.";
}
