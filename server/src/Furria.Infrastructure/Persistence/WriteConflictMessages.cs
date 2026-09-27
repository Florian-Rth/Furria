namespace Furria.Infrastructure.Persistence;

public static class WriteConflictMessages
{
    public const string OpenMembership = "Es läuft bereits eine Mitgliedschaft.";
    public const string OpenGroupMembership = "Diese Person gehört der Gruppe bereits an.";
    public const string OpenGroupAdmin = "Diese Person ist bereits Gruppen-Admin dieser Gruppe.";
    public const string OpenRoleHolding = "Diese Person hat diese Rolle bereits inne.";
    public const string DuplicateGroupName = "Eine Gruppe mit diesem Namen gibt es schon.";
    public const string DuplicateRoleName = "Eine Rolle mit diesem Namen gibt es schon.";
    public const string DuplicateVenue = "Diesen Ort gibt es schon.";
    public const string DuplicateBoardOffice = "Diese Vorstandsfunktion gibt es schon.";
    public const string DuplicateAttendanceResponse =
        "Für diesen Eintrag ist schon eine Antwort gespeichert.";
    public const string DuplicateGroupKind = "Diese Gruppenart gibt es schon.";
    public const string DuplicateParticipation = "Diese Gruppe wirkt bei diesem Eintrag schon mit.";
    public const string ClubRecordWrittenMeanwhile =
        "Die Vereinsdaten wurden gerade anderweitig gespeichert. Bitte erneut versuchen.";
    public const string InvitationIssuedMeanwhile =
        "Gerade wurde schon eine Einladung verschickt. Bitte erneut versuchen.";
}
