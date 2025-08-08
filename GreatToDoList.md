##Need a details Solution Design##

- ✅ User Management solution for managing different users with different permissions, simple to add further permissions, control access to pages/features with profiles per project. Easy configurable over UI (Admin). Password reset, profile management for every user with image, email, password, 2 factor auth via email or if possible without cost via Auth apps, state of the art security aspects (SOLUTION DESIGN COMPLETE - UserManagement_SolutionDesign.md)
- Audit Trails for platform usage: Tracking every action of every user in a DB. Success/Failure/Error/Exception or Debug Info
- ✅ Backup/Recovery Feature für Projekt States, User and so on (SOLUTION DESIGN COMPLETE - BackupRecovery_SolutionDesign.md)
- ✅ Mandanten- und Projektisolation (separate Umgebungen, Daten-Segregation), wobei jeder User 0-n Projekten zugewiesen werden kann mit Profil und zwischen den Projekten wechseln kann (in UI schon eingebaut). Der Wechsel eines Projektes soll einen komplett neuen State des Users laden. (SOLUTION DESIGN COMPLETE - TenantProjectIsolation_SolutionDesign.md)



## Actual ToDos with a proper Solution Design ##
- ✅ A Message solution: NotificationSystem_SolutionDesign.md (IMPLEMENTED - Phase 1 Complete)