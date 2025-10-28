# Parkhaus-Management: Transkript einer Unterhaltung zwischen Vertriebsmitarbeiter, CRM-Architekt und Kunde

## Teilnehmer

- Vertriebsmitarbeiter (V)
- CRM-Architekt (A)
- Kunde (K)

---

V: Guten Morgen und herzlich willkommen! Schön, dass Sie heute Zeit gefunden haben. Ich bin Max, verantwortlich für den Vertrieb. Neben mir ist meine Kollegin Lea, unsere CRM-Architektin. Dürfen wir uns duzen oder lieber beim Sie bleiben?

K: Guten Morgen, vielen Dank für die Einladung. Bleiben wir gern beim Sie. Ich bin Jonas Weber, technischer Leiter bei der Parkhausbetriebsgesellschaft Nordstadt.

A: Guten Morgen, Herr Weber. Schön, Sie kennenzulernen. Ich bin Lea, ich kümmere mich um die Architektur des CRM- und Integrations-Stacks.

V: Perfekt. Bevor wir in die Details einsteigen, vielleicht zwei Sätze zu uns: Wir helfen Betreiber:innen von Parkhäusern dabei, operative Abläufe zu digitalisieren, die Auslastung zu optimieren und Kundenerlebnisse über CRM, Tarifsteuerung und Analytik zu verbessern. Was hat Sie konkret zu uns geführt?

K: Kurz gesagt: Wir betreiben aktuell sieben Parkhäuser, dazu kommen zwei Außenflächen. Unsere Systeme sind historisch gewachsen. Wir haben Schrankenanlagen verschiedener Hersteller, eine ältere Kassensystem-Software und eine recht einfache Kundendatenverwaltung. Jetzt stehen zwei Dinge an: Erstens wollen wir die Durchlässigkeit für unterschiedliche Nutzergruppen erhöhen, also Kurzparker, Dauerparker, Anwohner, Firmenflotten. Zweitens brauchen wir ein zentrales System, in dem wir Kundenbeziehungen, Tarife, Verträge, Zahlungen, Störungen, Service-Tickets und Auslastungsdaten konsolidiert sehen. Ich denke da an ein CRM-gestütztes Parkhaus-Management, das auch mit unseren Schrankenanlagen und Payment-Gateways sprechen kann.

A: Verstanden. Also ein zentrales CRM als Rückgrat für Kunden- und Vertragsdaten, plus Integrationsschicht zu Schranken, Kassen, Bezahlprozessen, und idealerweise ein Analytics- bzw. Reporting-Layer für Auslastung und Revenue.

V: Und vermutlich möchten Sie auch dynamische Tarife, Reservierungen, vielleicht White-Listing über Kennzeichen, QR- oder RFID-Zutritt?

K: Genau. Kennzeichen-Erkennung haben wir an zwei Standorten, allerdings ohne saubere Integration ins CRM. RFID nutzen wir für Dauerparker-Karten. QR wäre für Event-Parking interessant.

...

<!-- Hinweis: Dieses Dokument enthält ein sehr langes, detailliertes Transkript. Es folgt in mehreren Abschnitten. -->

V: Vielleicht starten wir mit einem kurzen Überblick über Ihre heutigen Abläufe. Wie kommt ein Kunde zu Ihnen, wie wird er identifiziert, wie bezahlt er, und wie verwalten Sie anschließend die Beziehung?

K: Gern. Für Kurzparker ist der Ablauf recht klassisch: Einfahrt mit Ticketziehen an der Schranke, wir haben Barcode-Tickets. Die Kennzeichenerkennung protokolliert zwar, wird aber nicht operativ genutzt. Der Kunde bezahlt am Kassenautomaten mit Bargeld oder Karte, danach Ausfahrt – Ticket wird validiert. Für Dauerparker haben wir RFID-Karten, die monatlich abgerechnet werden. Das läuft über eine separate Debitorensoftware, die manuell gepflegt wird. Firmenkunden bekommen Sammelrechnungen, aber das ist ehrlich gesagt ein Excel-basierter Prozess mit viel Aufwand und Fehleranfälligkeit. Beschwerden oder Störungen landen via E-Mail oder Telefon beim Facility-Team und werden dort in einer einfachen Ticketliste verfolgt.

A: Das heißt, wir hätten mehrere Datenquellen: Ticketing/Kasse, Kennzeichenerkennung, RFID-Zugangskontrolle, Debitoren, sowie E-Mail/Telefon für Service-Anfragen. Und es fehlt ein zentrales System, das Kunden, Fahrzeuge, Verträge, Zahlungsflüsse und Vorfälle konsolidiert.

K: Exakt. Außerdem möchten wir neue Produkte einführen: reservierbare Parkplätze für Events, dynamische Preisgestaltung je nach Auslastung, und flexible Kontingente für Anwohner, Car-Sharing-Anbieter und Hotels. Wir möchten außerdem Parkrechte digital vergeben, also statt einer plastischen Karte lieber Kennzeichen- oder App-basierte Berechtigungen.

V: Verstanden. Was sind Ihre Top-Prioritäten auf Sicht der nächsten sechs bis neun Monate?

K: Priorität 1: Ein CRM-gestütztes Vertrags- und Kundenmanagement, das Dauerparker, Firmenkunden und potenziell auch Kurzparker, die sich registrieren, sauber abbildet. Priorität 2: Integrationen zu Schranke, Kennzeichen-Erkennung, Payment, damit wir churn-relevante Signale, Zahlungsstatus und Zutrittsrechte automatisiert prüfen können. Priorität 3: Ein Reporting, das uns Auslastung, Erlöse, No-Shows bei Reservierungen, Störungszeiten und Reaktionszeiten zeigt.

A: Und was wäre aus Ihrer Sicht ein No-Go oder ein besonderes Risiko?

K: Ein No-Go wäre, wenn wir unsere bestehenden Anlagen nicht zuverlässig ansteuern können – sprich, wenn die Schranken nicht sicher öffnen oder die Erkennung nicht zuverlässig mit den Berechtigungen abgeglichen wird. Risiko sehe ich in Datenqualität und Migration der bestehenden Verträge, außerdem in der Akzeptanz beim Team vor Ort.

V: Vollkommen nachvollziehbar. Lassen Sie uns strukturiert durchgehen: 1) Rollen und Nutzergruppen, 2) Kernprozesse, 3) Datenmodell und Integrationen, 4) Tarifierung und Produkte, 5) Reporting/Analytics, 6) Betrieb, Sicherheit, Compliance, 7) Einführung und Change Management.

A: Fangen wir mit den Nutzergruppen an. Welche Personas sehen Sie?

K: Intern haben wir: Kassenteam, Facility/Technik, Backoffice/Abrechnung, Vertrieb/Key Account, Geschäftsführung. Extern: Kurzparker (mit/ohne Registrierung), Dauerparker privat, Dauerparker geschäftlich, Flottenkunden, Anwohner, Hotels (für ihre Gäste), Eventveranstalter, Car-Sharing.

A: Für jede Gruppe definieren wir Zugriff und Prozesse. Beispiel: Das Kassenteam sieht tagesaktuelle Vorfälle, kann Zahlungen einsehen, aber keine Preise ändern. Das Backoffice verwaltet Verträge, Rechnungen, Mahnläufe. Vertrieb pflegt Firmenkunden, Angebote, SLAs, Kontingente. Technik verwaltet Integration, Störungsmeldungen, Wartungsfenster. Geschäftsführung sieht KPI-Dashboards.

V: Und bei externen Nutzern brauchen wir klare Journeys: Registrierung, Zahlungsmittel hinterlegen, Kennzeichen hinzufügen, Produkt buchen (z. B. Monatsabo), Reservierung, Einfahrt/Ausfahrt, Rechnung/Quittung abrufen, Supportfall melden.

K: Genau. Und wir wollen die Hürden niedrig halten: Für Kurzparker könnte es reichen, wenn sie beim Bezahlen optional ihre E-Mail hinterlassen, um eine Quittung zu bekommen oder einen Rabatt beim nächsten Mal. Für Dauerparker möchten wir Self-Service: Kennzeichen ändern, Rechnung runterladen, Zahlungsstatus prüfen, Pause/Urlaub melden.

A: Notiert. Dann zu Kernprozessen. Ich schlage vor, wir mappen die End-to-End-Flows. Beispiel „Dauerparker-Onboarding“: Lead kommt rein (Vertrieb), Angebot, Vertrag mit Tarif, Zahlungsart (SEPA, Kreditkarte), Identifikation (Kennzeichen, ggf. RFID), Aktivierung von Parkrecht an definierten Standorten/Zugängen, Synchronisation an Schrankencontroller, Monitoring, monatliche Abrechnung, ggf. Mahnwesen, Vertragsänderungen, Kündigung.

K: Das trifft es. Beim Mahnwesen brauchen wir Automatismen – also Erinnerung vor Fälligkeit, Mahnstufen, Sperrung des Parkrechts bei Zahlungsverzug mit definierter Karenz.

V: Und Sonderfälle: Was passiert bei Hardwareausfall? Manuelle Öffnung erlaubt, aber sauber protokolliert, damit kein Missbrauch entsteht.

A: Richtig. Dann „Kurzparker-Flow“: Einfahrt – optional Erkennung, Ticket – Zahlung – Ausfahrt. Mit Registrierung erweitert: Profil, Zahlungsmittel, digitale Quittung, Loyalitätspunkte oder Rabatt. Bei Reservierung: Vorab-Buchung, Quote prüfen, Preis dynamisch, Bestätigung, Ankunftsfenster, No-Show-Regel, ggf. Strafgebühr oder Kulanz. Die Schranke muss bei Kennzeichen oder QR die Reservierung erkennen.

K: Wichtig sind uns klare Regeln, wenn jemand außerhalb des Reservierungsfensters kommt, oder wenn Kennzeichen falsch erfasst wird. Wir brauchen Fallbacks: QR-Code am Terminal, Hotline-Knopf, temporärer Freigabecode durch das Team.

A: Aus Integrationssicht bedeutet das: Wir brauchen bidirektionale Schnittstellen zu den Schranken und Erkennungsmodulen. Einerseits schicken wir White- und Blacklists bzw. Tokens, andererseits bekommen wir Events: Einfahrt, Ausfahrt, Erkennungsresultat, Abweichungen. Gleiches für Kassenautomaten: Zahlungsereignisse, Fehlerzustände, Füllstände Bargeld, Kartenakzeptanz.

V: Wie ist Ihre Herstellerlandschaft bei Schranken und Erkennung?

K: Wir haben drei Hersteller im Bestand. Zwei unterstützen REST-APIs, einer hat ein MQTT-basiertes Eventmodell, allerdings proprietär. Außerdem laufen ältere Controller, die nur FTP-Listen verarbeiten. Das macht uns Bauchschmerzen.

A: Dann entwerfen wir eine Integrationsschicht mit Konnektoren: REST, MQTT, SFTP/FTP. Wir normalisieren Geräteereignisse in ein einheitliches Eventmodell und stellen sie dem CRM sowie einem Stream-Processor zur Verfügung. Für die Schranken-Whitelist können wir unterschiedliche Push-Mechanismen unterstützen: direkte API-Calls, Message-Bus, periodische Filesynchronisation. Wichtig ist Idempotenz und verlässliche Zustellung. Wir brauchen auch lokale Caches, falls die Verbindung ausfällt – Edge-Komponenten, die zuletzt gültige Berechtigungen lokal halten.

K: Edge klingt gut, denn zwei Parkhäuser haben schwankende Verbindungen. Wir wollen nicht, dass bei einem kurzen Netzausfall niemand rein- oder rauskommt.

A: Exakt. Wir definieren einen Degradationsmodus: Wenn Cloud/CRM nicht erreichbar ist, gelten lokal gecachte Berechtigungen für eine definierte Zeit. Ereignisse werden gepuffert und später synchronisiert. Gleichzeitig haben wir eine Notöffnung mit Audit-Log.

V: Kommen wir zum Datenmodell im CRM. Wir werden Entitäten brauchen: Kunde (Person/Firma), Kontakt, Vertrag, Standort, Zugangspunkt, Fahrzeug (Kennzeichen), Berechtigung, Produkt/Tarif, Reservierung, Rechnung, Zahlung, Mahnung, Störung, Service-Ticket, Gerät, Ereignis (Einfahrt/Ausfahrt/Fehler), sowie Preisregel.

K: Klingt umfangreich, aber notwendig. Wichtig ist, dass wir mehrere Kennzeichen pro Kunde verwalten können, einschließlich Historie. Außerdem muss klar sein, welche Berechtigungen an welchem Standort gelten. Bei Firmenkunden brauchen wir Kostenstellen und mehrere Nutzer.

A: Wir modellieren das polymorph: `Account` (Firma/Haushalt) und `Contact` (Person), dazwischen Rollen. `Vehicle` wird mit `Account` und optional `Contact` verknüpft. `Entitlement` verknüpft Vertrag/Produkt mit Standort/Zone und Zugangspunkten. `Reservation` referenziert `Vehicle` oder `Contact`, Zeitfenster und ggf. Stellplatz. Rechnungen hängen am `Account`, Zahlungen werden über PSP-Transaktionen referenziert, inklusive Mandatsreferenz bei SEPA.

V: Bei den Produkten brauchen wir Flexibilität: Monatstarife, Stundenpreise, Rabatte, Ereignisbasierte Preise, dynamische Anpassungen nach Auslastung, Happy-Hour-Logik, Validierungen durch Partner (z. B. Händler stempelt Parkticket und reduziert Gebühr).

K: Wir haben auch Anwohnerparken mit Kontingenten, begrenzt auf Adressnachweis. Und Eventparken mit festen Slots und Preisstaffel je nach Nachfrage.

A: Für Dynamik definieren wir ein Regelwerk: Basispreis, Multiplikatoren nach Auslastungsband, Zeitfensterregeln, Kundensegmentregeln, Promo-Codes, Validierungen. Die Engine sollte deterministisch und auditierbar sein. Wir versionieren Preisregeln und speichern Entscheidungserklärungen für Support und Revision.

V: Was Reporting betrifft: Welche KPIs sind entscheidend?

K: Auslastung je Standort/Zone/Zeitslot, Umsatz nach Segment und Tarif, durchschnittliche Parkdauer, Peak-Zeiten, Anteil Reservierungen vs. Walk-in, No-Show-Rate, Zahlungsausfälle, Mahnstatus, SLA-Erfüllung bei Störungen, MTTR der Technik, sowie Zufriedenheitswerte aus Kundenfeedback.

A: Dann brauchen wir ein DWH oder wenigstens eine saubere Datenpipeline in ein BI. Events werden in Near-Real-Time gestreamt, zentrale Dimensionstabellen für Standort, Produkt, Kunde, Zeit. Wir bieten Standard-Dashboards und erlauben Ad-hoc-Analysen. DSGVO-konforme Pseudonymisierung, wenn nicht personenbezogen ausgewertet werden muss.

V: Thema Sicherheit und Compliance: DSGVO, Auftragsverarbeitung, Löschkonzepte, Datenminimierung, Verschlüsselung, Rollenbasierte Zugriffe, Protokollierung. Bei Kennzeichendaten klare Aufbewahrungsfristen und Zweckbindung.

K: Wir haben interne Vorgaben: Kennzeichendaten von Kurzparkern ohne Registrierung sollen nach 14 Tagen gelöscht oder anonymisiert werden, es sei denn es gibt berechtigte Aufbewahrungsgründe (z. B. Betrugsfall). Für Dauerparker gelten Vertrags- und steuerrechtliche Fristen.

A: Das lässt sich konfigurierbar umsetzen: Retention-Policies pro Datendomäne, automatisierte Löschläufe, Audit-Trail. Verschlüsselung at rest und in transit, HSM-gestützte Schlüsselverwaltung für Zahlungsdaten – wobei Zahlungsdaten beim PSP bleiben, wir speichern nur Token.

V: Kommen wir zur Einführung. Welche Timeline stellen Sie sich vor?

K: Wir wollen innerhalb von sechs Monaten einen ersten produktiven Piloten in zwei Parkhäusern, mit Dauerparker-Verträgen, Kennzeichen-basiertem Zutritt, SEPA, Kreditkarte, grundlegenden Dashboards und Störungsmanagement. In einer zweiten Phase kommen Reservierungen und dynamische Preise.

A: Für den Piloten schlagen wir vor: 1) Datenbereinigung und Migration der Dauerparker-Verträge, 2) Integration zu den Schranken an den Pilotstandorten, 3) PSP-Anbindung, 4) Basistarife, 5) Rollen und Rechte, 6) Dashboards, 7) Schulungen und UAT, 8) Go-Live mit Hypercare.

K: Ja. Und bitte besonderes Augenmerk auf Offline-Fähigkeit und schnelle Reaktionszeiten bei Störungen in den ersten Wochen.

V: Gern. Reden wir über SLAs: Welche Erwartungen haben Sie?

K: Für das zentrale System 99,9% Verfügbarkeit, Support-Reaktionszeiten unter einer Stunde in der Go-Live-Phase, danach unter vier Stunden für hohe Priorität. Für Integrationen kritische Pfade mit Monitoring und automatisierten Alerts.

A: Wir bauen synthetisches Monitoring für Kernflüsse: Schreiben/Lesen von Berechtigungen, Roundtrip zu Schranken, Event-Latenzen, PSP-End-to-End-Testtransaktionen. Alarme gehen an unser On-Call-Team und auf Wunsch an Ihre Leitstelle.

V: Thema Kostenmodell: Wir kalkulieren eine Setup-Gebühr für Integration und Migration, plus eine laufende Lizenz/Service-Fee per Standort und optional volumenbasiert nach Transaktionen. Für Reservierungen und dynamische Preise gibt es modulare Zuschläge.

K: Das ist in Ordnung, solange die Transparenz da ist und wir Forecasts erstellen können. Bitte berücksichtigen Sie Fördermitteloptionen, wenn Nachhaltigkeitsfeatures wie eCharging-Integration mitgedacht werden.

V: eCharging ist ein gutes Stichwort. Haben Sie bereits Ladeinfrastruktur?

K: An einem Standort, separate Abrechnung beim Betreiber. Wir möchten perspektivisch integrieren, damit ein Nutzer ein kombiniertes Parken+Laden-Produkt hat.

A: Dann planen wir ein offenes Schnittstellenkonzept zu CPOs (OCPP/OCPI), so dass Ladeevents ebenfalls in CRM und Billing referenziert werden können. Später könnten dynamische Preise sogar Lade- und Parkkomponente berücksichtigen.

V: Bevor wir tiefer in Edge-Fälle gehen, lassen Sie uns gemeinsam einige Szenarien durchspielen.

K: Gern.

V: Szenario 1 – Dauerparker mit Zahlungsverzug: Fälligkeit verpasst, erste Mahnung, Karenz 7 Tage, danach Sperrung am Zugang. Kunde kommt an, Schranke bleibt zu, Hotline-Knopf. Wie gehen wir damit um?

K: Wir möchten, dass das System am Display einen klaren Hinweis gibt („Bitte Hotline kontaktieren“), die Leitstelle sieht sofort den Grund und kann einmalig eine Kulanz-Freigabe erteilen. Gleichzeitig wird ein Ticket erstellt, E-Mail an Kunde, Link zur Sofortzahlung. Bei Zahlung wird automatisch entsperrt.

A: Lösbar. Wir bilden Mahnstufen als Statusmaschine ab, Sperrflag synchronisiert sich an die Edge-Konnektoren. Kulanz-Freigabe erzeugt zeitlich begrenzte Entitlement-Ausnahme. Payment-Webhook hebt Sperre sofort auf.

V: Szenario 2 – Reservierung, verspätete Ankunft: Fenster 30 Minuten, Kunde kommt 45 Minuten später.

K: Wenn die Auslastung es erlaubt, soll Einfahrt dennoch möglich sein, aber ggf. mit Aufpreis. Bei hoher Auslastung verfallen Reservierungen, das System bietet nächstmögliche Alternative oder Erstattung minus Gebühr.

A: Das erfordert eine Echtzeit-Auslastungsbewertung. Wir zählen belegte Plätze über Ein-/Ausfahrtsereignisse und bekannte Reservierungen. Edge-Counter an Ein-/Ausfahrt mit periodischer Abgleichung.

V: Szenario 3 – Kennzeichen falsch erkannt.

K: Am Terminal QR- oder PIN-Fallback. Support kann Kennzeichen manuell korrigieren, System lernt und verbessert Erkennungsregeln. Wir wollen False-Positive-Rate monitoren.

A: Wir speichern Confidence-Scores der Erkennung, definieren Thresholds, bei Unsicherheit wird der Fallback vorgeschlagen. Wir anonymisieren Trainingsdaten per Hash und bewahren nur erlaubte Samples auf.

V: Szenario 4 – Firmenkunde mit Kontingent: 50 Stellplätze, dynamische Nutzung, Fahrer wechseln.

K: Wir brauchen eine Flottenverwaltung, in der der Fuhrparkleiter Fahrzeuge zuweist, temporäre Berechtigungen vergibt, Reports über Nutzung und Rechnungen nach Kostenstelle erhält.

A: Das CRM stellt ein Flottenportal bereit: Rollenkonzept, API für Firmen, CSV-Import, SSO-Option. Entitlements sind kontingentiert, FIFO oder Priorisierung, Benachrichtigung bei Auslastungsspitzen.

V: Szenario 5 – Händler-Validierung: Kunde parkt, geht einkaufen, bekommt Rabatt.

K: Händler-Portal mit QR- oder Stempel-App. Regeln: 1 Stunde frei ab 20 Euro Einkauf, sonst 30% Rabatt. Betrugsprävention: Limits pro Händler/Tag, Audit-Logs.

A: Regeln in Pricing-Engine, Händler als Partner-Accounts, Validierungen als Transaktionen mit Signatur. Anomalieerkennung über BI.

V: Klingt, als ob wir die zentralen Themen erfasst haben. Gibt es noch spezielle Anforderungen?

K: Ja, Barrierefreiheit an Terminals, mehrsprachige Oberflächen, und die Möglichkeit, lokale Veranstaltungen im System zu hinterlegen, um Reservierungskontingente und Preise automatisch anzupassen.

A: Wir integrieren einen Event-Kalender, entweder manuell pflegbar oder via API (Stadt/Eventanbieter). Regeln triggern Preis- und Kontingentänderungen. UI mehrsprachig, inklusive Screenreader-Optimierungen.

V: Lassen Sie uns über die technische Architektur sprechen: Cloud-native Kernplattform, Integrationslayer mit Konnektoren, Edge-Software an Standorten, CRM-Kern mit Entitäten und Workflows, Pricing-Engine, Payment-Integration, BI-Pipeline. Haben Sie Präferenzen für Cloud/On-Prem?

K: Bevorzugt Cloud (EU-Region), solange Edge die Offline-Fähigkeit sicherstellt und Datenhaltung DSGVO-konform ist.

A: Wir schlagen eine multi-tenant-fähige Plattform vor, aber mit strikter Mandantentrennung. Datenbanken pro Mandant oder logisch isoliert, Verschlüsselung pro Mandant. Edge nutzt sichere Tunnel, mit Gerätezertifikaten. Auth via OIDC, RBAC, und feingranulare Berechtigungen auf Entitäten.

V: Für den Pilot schlagen wir vor, zunächst zwei Konnektoren zu implementieren (REST, SFTP) und einen MQTT-Konnektor in Phase 2. Einverstanden?

K: Ja. Wichtig ist, dass wir den Hersteller mit FTP frühzeitig migrieren können, aber zur Not mit robusten Diff-Listen arbeiten.

A: Wir implementieren eine Diff-basierte Synchronisation, die nur Änderungen überträgt, mit Checksummen und Retry-Strategie.

V: Kommen wir zur Migration: Wie viele Dauerparker-Verträge gibt es an den Pilotstandorten?

K: Rund 1.200. Davon 30% Firmenkunden. Datenqualität variiert: Manche Kennzeichen fehlen oder sind veraltet.

A: Wir planen einen Bereinigungsprozess: Pre-Migration-Checks, Dublettenprüfung, Kennzeichenvalidierung, E-Mail- und Adress-Checks. Wir schicken Kommunikationskampagnen an Kunden, um fehlende Daten nachzufassen. Danach Schnittstelle oder CSV-Import ins CRM, mit Protokollen je Datensatz.

V: Für SEPA-Mandate klären wir mit Ihrem Zahlungsdienstleister die Mandatsübernahme. Alternativ holen wir neue Mandate per E-Signatur ein.

K: Unser PSP unterstützt beides, wir müssen aber die Timeline koordinieren.

A: Gern. Wir binden Webhooks des PSP an, um Zahlungsstatus in Echtzeit zu aktualisieren, Rücklastschriften zu erkennen und Mahnflüsse automatisch zu triggern.

V: Wie stehen Sie zu einem Kundenportal/App?

K: Ein Webportal reicht zunächst. Eine App könnte später kommen, vor allem für Push-Benachrichtigungen, Navigation, und digitale Zutrittstoken.

A: Das Portal authentifiziert per OIDC, Self-Service-Prozesse inklusive Kennzeichenpflege, Zahlungsmethode, Vertragswechsel, Urlaubsunterbrechung, Rechnungshistorie, Support-Chat.

V: Beim Thema Support: Wünschen Sie eine integrierte Ticketing-Lösung oder Schnittstelle zu Ihrem bestehenden System?

K: Wir haben kein etabliertes System, wir wären offen für ein integriertes Modul – solange es SLA-Workflows, Vorlagen, Anhänge, Zuweisungen, Eskalationen kann.

A: Dann liefern wir ein leichtgewichtiges ITSM/Ticketing-Modul, angebunden an Geräteereignisse. Störungen aus Schranken fließen direkt in Tickets, Status wird zurückgespielt, MTTA/MTTR gemessen.

V: Perfekt. Ich denke, wir haben einen soliden Überblick. Wollen wir die nächsten Schritte festhalten?

K: Ja, bitte.

V: 1) Wir erstellen ein grobes Zielbild-Dokument mit Architektur, Prozesslandkarte, MVP-Umfang und Meilensteinen. 2) Wir planen einen System- und Daten-Workshop für die Migration. 3) Wir stimmen die Hersteller-Schnittstellen im Detail ab. 4) Wir kalkulieren Kosten und Timeline. 5) Wir vereinbaren einen Pilottesttermin.

K: Einverstanden. Und bitte fügen Sie eine Risikobetrachtung hinzu, mit Migrations-, Integrations- und Akzeptanzrisiken sowie Gegenmaßnahmen.

A: Machen wir. Zusätzlich dokumentieren wir Degradations- und Notfallprozesse, inklusive manueller Freigaben, Rollen, und Audit.

V: Prima. Gibt es zum jetzigen Zeitpunkt weitere Fragen oder Bedenken?

K: Ein Punkt noch: Datenschutzfolgeabschätzung. Wir müssen die DSFA prüfen, insbesondere wegen Kennzeichenerkennung und Verknüpfung mit Kundendaten.

A: Wir unterstützen Sie mit Vorlagen und technischen Maßnahmen: Privacy by Design, Datentrennung, Pseudonymisierung, Logging, Zugriffskontrollen, Data Retention. Die DSFA führen wir gemeinsam mit Ihrem Datenschutzbeauftragten durch.

V: Wunderbar. Dann bedanke ich mich für das offene Gespräch. Wir senden Ihnen bis Ende der Woche das Zielbild und Vorschlag für den Pilot.

K: Vielen Dank. Ich freue mich auf die Unterlagen.

---

V: Ich schlage vor, wir gehen nun noch tiefer in einige Bereiche, damit das Zielbild präziser wird. Fangen wir mit der Pricing-Engine an. Herr Weber, wie granular wünschen Sie Preisregeln zu steuern?

K: Wir brauchen mindestens folgende Dimensionen: Standort, Zone, Wochentag, Uhrzeit, Auslastungsband, Kundensegment, Event-Kontext, Validierung durch Partner, und Sonderfälle wie Feiertage. Regeln sollen sich kombinieren lassen, aber wir möchten Transparenz, welches Regelset angewendet wurde.

A: Wir können ein regelbasiertes System mit Prioritäten und Stopp-Bedingungen umsetzen. Jede Regel liefert einen Preisbeitrag oder Multiplikator. Eine Explain-Funktion protokolliert die angewandten Regeln. Zusätzlich können wir Varianten testen (A/B), um zu lernen, welche Preislogiken Umsatz oder Auslastung verbessern.

V: Wie stehen Sie zu dynamischen Preisen in Echtzeit?

K: Vorsichtig. Wir möchten mit Zeitfenster-basierten Anpassungen starten und später optional Echtzeit-Auslastung berücksichtigen. Wichtig ist, dass Stammkunden nicht überrascht werden – Transparenz ist uns wichtig.

A: Dann beginnen wir mit vordefinierten Bändern und definierter Höchstabweichung pro Zeitraum. Außerdem können wir Preisgarantien für bestimmte Produkte geben.

V: Wechseln wir zum Thema Entitlements. Wie viele Zugangspunkte pro Standort?

K: Typisch zwei Einfahrten, zwei Ausfahrten, teilweise separate Zonen. Manche Standorte haben Mitarbeiterzufahrten. Wir brauchen granulare Steuerung, an welchen Gates welches Entitlement gilt.

A: Wir modellieren `AccessPoint` und `AccessZone`. Ein `Entitlement` referenziert Zonen oder einzelne AccessPoints. Für Edge-Konnektoren stellen wir kompakte Listen bereit: Hash-basierte Deltas, damit wir bei 10.000 Entitlements effizient bleiben.

V: Wie viele gleichzeitige Entitlements erwarten Sie im Zielbild?

K: In Summe vielleicht 15.000 bis 25.000, abhängig von Wachstum und Flottenkunden.

A: Das ist gut handhabbar. Wir dimensionieren die Edge-Komponenten so, dass 50.000 Einträge lokal performant gehalten werden können. Synchronisation inkrementell, mit Quotas, um Bandbreite zu schonen.

V: Thema Kennzeichenerkennung: Welche Trefferquote haben Sie heute?

K: Variiert. Tagsüber 95-97%, nachts und bei Regen schlechter. Wir brauchen gute Beleuchtung und Kamerapositionen. Softwareseitig möchten wir konfigurierbare Thresholds.

A: Wir definieren Confidence-Schwellen pro Standort und Tageszeit, optional adaptiv. Bei niedriger Confidence wird der Fallback aktiver angeboten. Wir protokollieren Samples nur, wenn aktiv zugestimmt oder ein Sicherheits- bzw. Betrugsfall vorliegt, und löschen sie fristgerecht.

V: Bei Reservierungen: Wie möchten Sie Stellplätze verwalten – frei flottierend oder feste Slots?

K: Zunächst frei flottierend. Feste Slots nur für VIP- oder Spezialfälle. Wir möchten Überbuchungsfaktoren capping, z. B. 1,1 bei Erfahrung, dass 10% No-Shows sind.

A: Wir bauen ein konfigurierbares Overbooking, mit Risikoindikatoren. Bei kritischer Auslastung schalten wir Reservierungsfenster zu oder heben Preise an.

V: Was ist Ihnen beim Kundenportal besonders wichtig?

K: Einfache Registrierung, 2FA optional. Gute Übersicht zu laufenden Verträgen, direktes Ändern des Kennzeichens, Rechnungshistorie, Download als PDF, Support-Kontakt. Gern auch Benachrichtigung, wenn Parkrecht bald endet oder Zahlung aussteht.

A: Wir benutzen transaktionale E-Mails und optional SMS/Push. Benachrichtigungsregeln sind pro Kunde steuerbar. Barrierefreiheit WCAG-konform.

V: Wechseln wir zu Betrieb und Monitoring.

K: Wir möchten Dashboards für Live-Status der Standorte: Schranke offen/geschlossen, Störungen, Auslastung, Kassensysteme, PSP-Status. Außerdem Alarme via E-Mail/SMS und Schnittstellen zu unserem Leitstand.

A: Wir liefern ein NOC-Dashboard. Jede Edge-Komponente sendet Herzschläge. Für Schranken messen wir Roundtrip: Berechtigung schreiben – Gerät bestätigt – Testdurchfahrt simuliert. Bei Ausfall automatische Eskalation. Logs strukturiert in ein SIEM, mit rollenbasiertem Zugriff.

V: Security: Penetrationstests, Härtung der Edge-Geräte, Firmware-Updates OTA, Zertifikatsrotation.

K: Ja, plus physische Sicherheit in Technikräumen. Wir protokollieren Zugriff und Konfigurationsänderungen.

A: Wir setzen signierte Firmware-Pakete, Secure Boot, TPM-gebundene Zertifikate. Konfiguration als Code, versioniert, mit Vier-Augen-Freigaben.

V: Gut. Nun zu Rechts- und Datenschutzfragen. Sie sprachen die DSFA an. Gibt es weitere Compliance-Vorgaben?

K: Kommunale Vorgaben beim Anwohnerparken, steuerliche Anforderungen an Rechnungen, Aufbewahrungsfristen. Außerdem Barrierefreiheit und Informationspflichten bei Video/Erkennung.

A: Wir stellen konfigurierbare Datenschutzhinweise bereit, mehrsprachig, und binden Kamera-Hinweise in die Beschilderung ein. Die Systeme loggen Zwecke der Datenverarbeitung, Betroffenenrechte werden unterstützt (Auskunft, Löschung, Berichtigung).

V: Ich glaube, wir haben ausreichend Detail für das Zielbild. Lassen Sie uns zum Abschluss die Erfolgskriterien für den Piloten definieren.

K: Gern. Erfolg ist, wenn: 1) Dauerparker an Pilotstandorten zuverlässig per Kennzeichen ein- und ausfahren, 2) Zahlungen und Rechnungen korrekt laufen, 3) SLAs für Störungsreaktion eingehalten werden, 4) Dashboards verständliche KPIs liefern, 5) unser Team das System akzeptiert und produktiv nutzt, 6) es in den ersten acht Wochen keine kritischen Ausfälle gibt.

A: Einverstanden. Wir dokumentieren detaillierte Abnahmekriterien und Testfälle – inklusive Chaos-Tests für Offline-Modus.

V: Perfekt. Wir melden uns mit den Unterlagen.

K: Danke.

---

V: Für das Zielbild-Dokument hätte ich gern, dass wir die Workshops strukturieren. Dürfen wir gemeinsam die Agenda der nächsten Sessions festlegen?

K: Sehr gern. Welche Themen schlagen Sie vor?

A: Vorschlag für drei Blöcke: 1) Daten & Migration, 2) Integrationen & Edge, 3) Produkte, Tarife, Billing. Zusätzlich ein Querschnitts-Workshop zu Security, Compliance, Monitoring.

K: Klingt gut. Fangen wir mit Daten & Migration an. Worauf achten wir?

A: Auf die Quellsysteme und deren Datenqualität. Wir brauchen volle Exporte der Dauerparker-Verträge, inklusive Vertragslaufzeiten, Preismodelle, Zahlungsarten, Kennzeichen, Historien. Außerdem brauchen wir Kundendaten (Personen/Firmen), Ansprechpartner, SEPA-Mandate, offenen Posten, Mahnstufen. Für Kurzparker ist es optional, aber historisierte Ein- und Ausfahrten wären wertvoll fürs Reporting.

V: Wie gehen wir mit Dubletten um?

K: Wir haben Dubletten – manchmal ist dieselbe Firma mehrfach angelegt, oder ein privater Kunde ist auch als Kontakt einer Firma erfasst.

A: Wir führen einen dedizierten Data-Cleansing-Schritt durch. Regellogik für Dublettenerkennung: E-Mail, Telefonnummer, Adresse, Firmierung mit Fuzzy-Matching, Umsatzsteuer-ID. Entscheidungen protokolliert, manuelle Freigabe bei unsicheren Fällen. Wir bauen eine Migrations-Pipeline mit Validierungsberichten und Fehler-Queues für unvollständige Datensätze.

K: Wie stellen wir sicher, dass während der Migration der Betrieb nicht leidet?

A: Wir planen eine Delta-Migration kurz vor Go-Live. Zuerst Vollimport in eine Staging-Umgebung, Tests, UAT. Danach Delta-Import der seitdem geänderten Datensätze. Wir vereinbaren ein kurzes Freeze-Fenster für kritische Tabellen (Verträge, Mandate), während wir Entitlements an die Edge pushen. Schranken bleiben betriebsbereit, da Edge weiter mit alten Listen läuft, bis wir umschalten.

V: Klingt robust. Wechseln wir zu Integrationen & Edge. Welche Geräte-Topologie haben wir in den Pilotstandorten?

K: Standort A: Zwei Einfahrten, zwei Ausfahrten, Kennzeichenerkennung an Einfahrten, RFID-Leser an einem Mitarbeitergate. Kassenautomaten von Hersteller X, Schranken von Hersteller Y. Standort B: Eine Einfahrt, eine Ausfahrt, ältere Controller nur FTP-basiert, Kassen von Hersteller Z, keine Kennzeichenerkennung.

A: Wir installieren an beiden Standorten Edge-Boxen mit redundanten Netzteilen. Standort A: REST- und MQTT-Konnektor, Standort B: SFTP/FTP-Konnektor. Beide mit lokalem Cache für Entitlements, und Event-Puffer. Wir definieren Health-Probes: Konnektivität zur Cloud, Latenz zu Schranken, Kamera-Status, Füllstände Kassen.

K: Wie werden Updates verteilt?

A: Over-the-Air, signierte Pakete, Blue-Green-Deployment auf Edge, Rollback bei Fehlern. Wartungsfenster können wir planen, kritische Patches können wir kontrolliert ausrollen.

V: Thema Sicherheit: Wie schützen wir Edge-Geräte?

K: Was schlagen Sie vor?

A: Härtung des OS, minimale Dienste, Firewall auf dem Gerät, verschlüsselter Datenspeicher, TPM-unterstützte Zertifikate. Zugang nur per kurzlebigen, rollenbasierten Tokens, Audit-Logs, kein Default-Login. Physische Sicherheit durch Plomben und Gehäuseschloss.

K: Gut. Was ist zur Geräteinventarisierung nötig?

A: Jedes Gerät bekommt eine eindeutige Identität im zentralen Inventar. Wir speichern Standort, Firmware-Version, Konnektoren, letzte Heartbeats, offene Störungen. Konfigurationsänderungen laufen über genehmigte Changes.

V: Kommen wir zu Produkten, Tarifen und Billing. Welche Produkte wollen Sie im Piloten abbilden?

K: Drei Produkte: 1) Dauerparker Standard (Monatstarif, Kennzeichen-basiert, 24/7), 2) Dauerparker Business (Monatstarif, mehrere Kennzeichen, Kontingent 2 gleichzeitig), 3) Kurzparker Walk-in (stundengenau, fixe Tariftabelle ohne Dynamik). Optional ein Reservierungsprodukt in Phase 2.

A: Wir konfigurieren diese als Katalogeinträge mit Attributen: Laufzeit, Kündigungsfrist, inkludierte Zonen, gleichzeitige Nutzung, erlaubte Identifikatoren (Kennzeichen, RFID), Preisbasis. Billing monatlich im Voraus für Dauerparker, tagesgenau pro-rata bei Vertragsbeginn/Ende. Kurzparker im Pay-per-Use mit Kassen- oder App-Bezahlung.

V: Was ist mit Rabatten?

K: Firmenkunden erhalten Mengenrabatte, z. B. ab 20 Plätzen 5%, ab 50 Plätzen 10%. Anwohner haben Sonderpreise nach Nachweis. Promotions saisonal.

A: Wir modellieren Rabattregeln segmentbasiert. Bei Rechnungsstellung werden Rabatte ausgewiesen. Für Anwohner kann das System periodisch Nachweise anfordern und bei Ablauf automatisch den Tarif umstellen.

V: Gehen wir tiefer in Abrechnung und Zahlungsflüsse.

K: Wir arbeiten mit PSP QPay. Kreditkarte, SEPA-Lastschrift, optional PayPal für App-Zahlungen. Wir möchten Tokenisierung, automatische Abbuchung, und Mahnwesen bei Fehlern.

A: Wir binden QPay über deren REST-Webhooks an. Zahlungsinstrumente werden tokenisiert beim PSP. Wir halten nur Referenzen. Für SEPA beachten wir Vorankündigungen (Pre-Notification). Bei Rücklastschrift setzen wir Vertrag in „Mahnstufe 1“ und benachrichtigen automatisiert. Nach Stufe 3 Sperre.

K: Wie erzeugen wir steuerkonforme Rechnungen?

A: Wir generieren Rechnungen aus dem CRM mit fortlaufenden Nummern, Buchungssätzen, Steuersätzen, rechtlich korrekten Pflichtangaben, und archivieren sie revisionssicher. Export-Schnittstelle zur Finanzbuchhaltung (DATEV/CSV/API).

V: Datenfluss im Event-Fall: Einfahrt, Ausfahrt – wo landet das?

K: Im CRM, in der Historie des Fahrzeugs und Kunden, und im DWH für Analysen.

A: Richtig. Wir haben einen Event-Bus. Edge sendet Ein-/Ausfahrtsereignisse, wir validieren und reichern sie an (Kunde, Vertrag, Preisregel-Kontext), persistieren sie in einem Event-Store und schreiben relevante Aggregationen in das CRM (zuletzt gesehen, Nutzungsstatistik), sowie in ein DWH für BI.

V: Welche SLAs gelten für Event-Latenzen?

K: Für Zutrittsentscheidungen maximal 300 ms von Anfrage bis Antwort, ideal lokal am Edge. Für Analytics reichen Sekunden bis Minuten.

A: Zutritt erfolgt am Edge aus dem lokalen Cache (Latenz < 50 ms). Cloud-Synchronisation ist asynchron. Analytics-Streaming zielt auf < 30 Sekunden.

V: Lassen Sie uns ein paar Sequenzdiagramme gedanklich durchgehen – zur Absicherung des Designs.

K: Gern.

A: Sequenz „Dauerparker-Einfahrt“: Kamera erfasst Kennzeichen → Edge-ANPR liefert String + Confidence → Edge prüft Entitlement-Cache → Treffer? ja → Schranke öffnet, Event „Einfahrt“ mit Kunden-/Vertragsreferenz wird in die Cloud gepusht → CRM aktualisiert „zuletzt gesehen“, DWH aktualisiert Auslastung. Bei nein → Fallback: Terminal bietet QR/PIN → Support-Freigabe möglich → Ereignis protokolliert.

K: Sequenz „Mahnungsbedingte Sperre aufgehoben“: Kunde begleicht Zahlung in App → PSP-Webhook an Cloud → CRM setzt Status „aktiv“ → Edge bekommt Delta-Update → nächster Zutritt erlaubt.

A: Sequenz „Reservierung erkannter Kunde“: Vorab-Buchung erzeugt Token → Edge hat Whitelist-Eintrag zur Zeitspanne → Einfahrt → Validierung gegen Zeitfenster. Bei Verspätung prüft System Auslastung und Regel „Kulanz“.

V: Alles klar. Wie schulen wir unser Team?

K: Wir benötigen Schulungen für: Kassenteam (Sicht auf Zahlungen, Quittungen, Fehlerbilder), Technik (Edge/Integration, Notfallprozesse), Backoffice (Verträge, Billing, Mahnwesen), Vertrieb (Firmenkunden, Angebote), Geschäftsführung (Dashboards). Außerdem kurze Anleitungen für Kundenportal.

A: Wir erstellen Rollen-spezifische Trainings mit praxisnahen Szenarien. Zusätzlich Quick-Reference-Cards, E-Learning-Videos und eine Sandbox-Umgebung. In den ersten vier Wochen nach Go-Live bieten wir virtuelle Sprechstunden.

V: Change Management – was sind erfahrungsgemäß Stolpersteine?

K: Akzeptanz bei Kassenteam und Technik, wenn neue Oberflächen und Abläufe kommen. Angst vor Kontrollverlust, wenn Entscheidungen automatisiert werden. Außerdem Bedenken wegen Datenschutz.

A: Wir adressieren das mit frühzeitiger Einbindung, Testläufen, klaren Eskalations- und Override-Prozessen. Transparenz: Jede automatische Entscheidung ist erklärbar, Overrides werden sauber protokolliert, und das Team hat klare Rechte. Datenschutz werden wir durch Schulungen und technische Maßnahmen greifbar machen.

V: Risiko-Register – sammeln wir die wichtigsten Punkte und Gegenmaßnahmen.

K: Bitte.

A: Risiken: 1) Integrationsrisiken mit älteren Controllern → Gegenmaßnahme: SFTP-Diff-Strategie, frühe Tests, Fallback-Listen. 2) Datenqualität → Bereinigung, Validierung, Kommunikationskampagne. 3) Offline-Szenarien → Edge-Cache, Puffer, Notöffnung mit Audit. 4) Akzeptanz → Schulungen, Hypercare, klare Prozesse. 5) Zahlungsabbrüche → PSP-Retries, alternative Zahlungsarten, automatische Benachrichtigungen. 6) DSGVO → DSFA, Retention-Policies, Pseudonymisierung, TOMs. 7) Skalierung → Lasttests, Monitoring, horizontale Skalierung. 8) Betrugsversuche → Anomalieerkennung, Limits, manuelle Prüffälle.

K: Ergänzen Sie bitte Lieferkettenrisiken, z. B. Kameraausfälle oder Ersatzteilmangel.

A: Guter Punkt. Wir fügen Hardware-Risiken hinzu, mit Ersatzteilpuffer, SLA mit Herstellern, und temporären Betriebsmodi (z. B. manuelle Tickets).

V: Ich möchte noch die Kundenerlebnisse konkretisieren. Was wäre ein idealer Flow für einen neuen Dauerparker?

K: Landingpage → Produkt wählen → Konto anlegen → Zahlungsmittel hinterlegen → Kennzeichen angeben → Vertrag digital signieren → Sofortaktivierung → Willkommensmail mit Hinweisen → Erste Einfahrt klappt ohne Stopp. Portal zeigt „Aktiv“, nächste Rechnung und Historie sichtbar.

A: Wir setzen eSign-Integration ein, DSGVO-konform. Sofortprüfung der Zahlungsmethode. Edge bekommt das Entitlement in Sekunden.

V: Für Kurzparker mit Registrierung: Einfahrt → Parken → Bezahlen am Automaten oder App → Digitale Quittung → Option „Kennzeichen speichern“ für schnellere Ausfahrt beim nächsten Mal.

K: Genau. Und für Events: Vorab-Reservierung → QR im Wallet → Zutritt auch bei schlechter Erkennung über QR möglich → Navigation zum freien Bereich.

A: Wir integrieren Wegweiser-Logik optional in Phase 2: Sensorik pro Zone oder Auslastungsschätzung über Ein-/Ausfahrten, Anzeige an Displays.

V: Wir sollten die Reporting-Anforderungen in Berichten gießen. Welche Standard-Reports wünschen Sie?

K: Monatsreport Auslastung je Standort/Zone, Umsatz nach Tarif, Mahnstatus, Störungszeiten und MTTR, Top-10-Fehlerursachen, Kundenwachstum, Kündigungsgründe, Reservierungsquote und No-Shows, Validierungsnutzung durch Händler.

A: Wir liefern diese als vordefinierte BI-Dashboards, plus CSV-Exporte. Rechtebasiert: Geschäftsführung sieht alle Standorte, Standortleiter nur ihren.

V: Für das Security-Thema noch ein Wort zu Zugriffsverwaltung.

K: Wir möchten SSO für Mitarbeiter, MFA für kritische Rollen. Detaillierte Rollen (z. B. Kassierer darf Quittungen einsehen, aber keine Preise ändern). Protokollierung aller Admin-Aktionen.

A: Wir integrieren OIDC mit Ihrem IdP, setzen MFA-Richtlinien, auditieren Änderungen, und bieten Just-in-Time-Zugriff mit zeitlicher Begrenzung für Support.

V: Wie gehen wir mit Third-Party-Partnern um, etwa Hotels oder Händler?

K: Partnerportal mit eingeschränktem Zugriff: Validierungen ausstellen, Kontingente verwalten, einfache Reports. Kein Zugriff auf personenbezogene Kundendaten.

A: Wir implementieren eine strikte Mandantentrennung und rollenbasierten Zugriff auf partnerbezogene Daten. Jede Validierung ist pseudonymisiert, nur transaktionsbezogene Metadaten sind sichtbar.

V: Abschließend: Kommunikationsplan zum Go-Live.

K: Intern: Trainings, Handbücher, Schicht-Infos. Extern: E-Mail an Dauerparker mit Neuerungen, Portalzugang, Datenschutzhinweisen. Vor Ort: Beschilderung zu QR/Hotline. Presse optional.

A: Wir erstellen Templates und Zeitplan. Eine Woche vor Go-Live Pre-Live-Test, drei Tage vorher Freeze, am Go-Live Tag Präsenzteam und Hotline Verstärkung.

V: Perfekt. Damit haben wir eine gute Grundlage.

K: Ja, ich fühle mich abgeholt.

---

V: Ich würde gern exemplarische Edge-Fallback-Situationen weiter durchspielen, um zu prüfen, ob unsere Prozesse robust sind.

K: Einverstanden.

A: Fall A – Cloud-Verbindung down, Edge online: Entitlements werden lokal geprüft, Schranken funktionieren. Events werden gepuffert. Nach Wiederherstellung wird synchronisiert. Risiko: Überbuchung bei Reservierungen. Gegenmaßnahme: Lokale Reservierungsfenster, konservative Overbooking-Faktoren und Zeitpuffer.

K: Fall B – Edge offline oder Hardwaredefekt: Schranken erhalten keine Updates. Operation: Notöffnungen über mechanische Schlüsselschalter nur mit Supervisor-Freigabe, manuelles Logbuch, Kameraaufzeichnungen zur späteren Rekonstruktion. Temporär Übergang auf Ticketmodus.

A: Fall C – Kameraausfall: Umschalten auf QR/RFID bevorzugt. Hinweis am Display. Supportticket automatisch, Techniker-Dispatch.

V: Fall D – PSP-Störung: App-Zahlungen temporär deaktiviert, Kassenautomaten im Offline-Mode erlauben Bargeld. Bei Kreditkarte offline nur, wenn PCI-konformal und betrieblich zulässig. Späterer Settlement-Abgleich.

K: Wir möchten klare Betriebsanweisungen für das Personal, damit in Ausfällen schnell und korrekt gehandelt wird.

A: Wir dokumentieren Standard Operating Procedures (SOPs) pro Fall, mit Entscheidungsbäumen und Eskalationsketten.

V: Lassen Sie uns eine tiefergehende Betrachtung zum Thema Betrugsprävention machen.

K: Woran denken Sie?

A: Missbrauchsszenarien: 1) Weitergabe von QR-Codes, 2) Manipulation von Kennzeichen (Abdeckung, Verfälschung), 3) Händler-Validierungsbetrug, 4) Missbrauch von Kulanz-Freigaben, 5) Insider-Missbrauch. Gegenmaßnahmen: QR an Gerät gebunden mit kurzer TTL, ANPR mit Plausibilitätschecks (Farb-/Fahrzeugklasse optional), Limits und Mustererkennung, Vier-Augen-Prinzip für Kulanz, Audit-Logs und Anomaliealarme.

K: Ergänzen Sie bitte Fotosnapshots bei Konfliktfällen, DSGVO-konform, und nur bei legitimer Grundlage.

A: Ja, Snapshots nur bei konkreter Rechtsgrundlage, temporär verschlüsselt, Zugriff stark eingeschränkt, automatische Löschung nach Frist.

V: Ich möchte noch etwas zum Thema Kapazitätsplanung hören.

K: Wir benötigen Prognosen für Auslastung je Tag und Zeitband, um Personal und Preise zu planen.

A: Wir implementieren Time-Series-Forecasting basierend auf historischen Ein-/Ausfahrten, Wetter, Events, Saisonalitäten. Die Prognosen fließen in Dashboards und können Preisregeln vorschlagen (ohne Auto-Apply, es sei denn freigegeben).

V: Roadmap nach dem Piloten: Welche Erweiterungen sind für Sie attraktiv?

K: Reservierungen und Dynamic Pricing, integrierte EV-Ladeabrechnung, Hotel-Integrationen (PMS), API für Drittanbieter-Apps (Mobility), und Gamification im Kundenportal (Treuepunkte).

A: Wir strukturieren die Roadmap in Quartale und priorisieren nach Wert und Aufwand. API wird dokumentiert (OpenAPI), Sandbox für Partner. EV-Integration über OCPI/OCPP mit Roaming-Partnern.

V: Hervorragend. Ich denke, damit sind wir für die nächsten Schritte gerüstet.

K: Ja. Ich freue mich auf die Dokumente.

---

V: Bevor wir schließen, würde ich gern noch konkrete User Stories formulieren, um den Umfang messbar zu machen. Einverstanden?

K: Ja, bitte. Das hilft uns später bei den Abnahmen.

A: Gut, ich formuliere und wir kalibrieren gemeinsam.

V: Los geht's.

A: Als Backoffice-Mitarbeiter möchte ich einen neuen Dauerparker-Vertrag für eine Privatperson anlegen, damit der Kunde ab sofort per Kennzeichen Zugang zu den Pilot-Standorten erhält. Akzeptanzkriterien: Pflichtfelder validiert, SEPA- oder Kreditkarte hinterlegt, Kennzeichen eindeutig, Entitlement innerhalb von 60 Sekunden an Edge ausgerollt, Bestätigungs-E-Mail versendet.

K: Ergänzen Sie bitte: Bei fehlender E-Mail soll ein Brief-Workflow startbar sein.

A: Notiert. Zweite Story: Als Firmenkundenbetreuer möchte ich für einen Account „Muster GmbH“ 30 Plätze im Tarif „Business“ buchen, mit bis zu zwei gleichzeitigen Nutzungen pro Platz, damit rotierende Fahrzeuge Zugang erhalten. Akzeptanzkriterien: Kontingente pro Standort, Verwaltung mehrerer Kennzeichen pro Fahrer optional, Kostenstellen-Zuordnung auf Rechnung.

V: Dritte: Als Kassenteam-Mitglied möchte ich eine Zahlung eines Kurzparkers nachträglich korrekt zuordnen, wenn der Automat offline war, damit der Kunde korrekt ausfahren kann und die Buchhaltung stimmt. Akzeptanzkriterien: Suche nach Ticket-ID, Kennzeichen oder Zeitfenster; Verbuchung erzeugt korrekten Datensatz; Quittung per E-Mail.

K: Vierte: Als Techniker möchte ich bei Störung „Kamera 1 keine Erkennung“ automatisch ein Ticket erhalten, damit ich schnell reagieren kann. Akzeptanzkriterien: Automatische Erkennung des Fehlers, Ticket mit Priorität, Eskalation, und Verlinkung auf das Gerät im Inventar.

A: Fünfte: Als Dauerparker möchte ich im Portal mein Kennzeichen ändern können, damit ich mit einem neuen Fahrzeug einfahren kann. Akzeptanz: Validierung auf bestehende Konflikte, sofortige Synchronisation, Bestätigungs-E-Mail.

V: Sechste: Als Finanzleiter möchte ich Monatsrechnungen für Dauerparker und Firmenkunden automatisch generieren und via DATEV-Export an die Buchhaltung liefern. Akzeptanz: Numerische Sequenz, steuerkonforme Angaben, korrekt ausgewiesene Rabatte, Export validiert.

K: Siebte: Als Standortleiter möchte ich ein Dashboard mit Live-Auslastung, Störungsstatus und Durchsatz sehen, um operative Entscheidungen zu treffen.

A: Achte: Als Datenschutzbeauftragter möchte ich Export- und Löschanforderungen für personenbezogene Daten bearbeiten, um DSGVO-Anfragen zu erfüllen.

V: Neunte: Als Eventmanager möchte ich ein Reservierungskontingent für Samstag 18–22 Uhr anlegen, dynamische Preisregel „+20%“ und QR-Zutritt aktivieren, damit Veranstaltungsgäste reibungslos parken können.

K: Zehnte: Als Leitstelle möchte ich aus dem Alarm „Mahnsperre – Kunde am Gate“ heraus eine einmalige Kulanz-Freigabe erteilen können, protokolliert und mit automatischer Benachrichtigung an den Kunden.

A: Diese Stories bilden einen guten MVP-Kern. Wir ergänzen Priorisierung und Aufwandsschätzung.

V: Lassen Sie uns, zur Vollständigkeit, noch die nicht-funktionalen Anforderungen festhalten.

K: Verfügbarkeit 99,9% für den Cloud-Kern, Latenz Edge < 50 ms für Entscheidungen, Cloud-Roundtrip nicht mission-kritisch. Sicherheit: Rollenbasiert, MFA, Audit. Datenschutz: Retention-Policies, DSFA. Skalierbarkeit: bis 25.000 Entitlements, 10 Events/Sekunde pro Standort, 100 parallele Web-Portal-Nutzer im Peak.

A: Performance-Ziele sind realistisch. Wir planen horizontale Skalierung für Event-Ingestion, Caching-Layer für CRM-Reads, und Backpressure-Strategien im Stream.

V: Gut, dann wechseln wir noch einmal in eine offene Fragerunde, damit nichts offen bleibt.

K: Eine Frage zur Preisgestaltung bei Validierungen: Wie verhindern wir, dass Händler übermäßig validieren?

A: Wir setzen Limits und Reporting. Je Händler tages- und monatsbasierte Kontingente, Schwellwerte für Alarme, stichprobenartige Prüfungen. Optional gekoppelt an POS-Transaktionsnachweise via API.

V: Und zur Barrierefreiheit: Welche Sprachen sind gesetzt?

K: Deutsch und Englisch zu Beginn, später Französisch und Niederländisch.

A: Wir bauen I18n-Framework, UI-Texte austauschbar, Sprache pro Standort konfigurierbar, Default anhand Browser/Terminal.

V: Thema Supportzeiten: Benötigen Sie 24/7?

K: Für kritische Störungen ja, ansonsten Geschäftszeiten.

A: Wir bieten Bereitschaft für P1/P2 24/7, P3/P4 in Geschäftszeiten.

V: Eine letzte technische Vertiefung zum Eventmodell.

K: Gern.

A: Ereignistypen: AccessRequested, AccessGranted, AccessDenied, LicensePlateRecognized, ManualOverride, PaymentCaptured, PaymentFailed, DeviceHealthChanged, TicketOpened, TicketResolved, ReservationCreated, ReservationNoShow, ValidationApplied. Jedes Event hat Zeit, Standort, Quelle, Korrelation (z. B. Fahrt-ID), optional PII-Referenzen, die per Policy maskiert werden können.

K: Wie korrelieren wir Ein- und Ausfahrt zu einer Parkdauer?

A: Wir bilden eine Session je Fahrzeug/Gate-Cluster. Regeln: Einfahrt startet Session, Ausfahrt beendet. Anomalien (z. B. fehlende Ausfahrt) werden heuristisch gehandhabt, mit Timeouts und Korrektur durch Kassenereignisse.

V: Aus meiner Sicht ist das ausreichend. Ich denke, wir können nun wirklich schließen.

K: Einverstanden. Vielen Dank für die umfassende Beratung.

---

V: Nachbesprechung intern (ohne Kunde): Lea, wir sollten das Zielbild bis Freitag fertig haben. Ich übernehme die kommerziellen Teile.

A: Einverstanden. Ich schreibe Architektur, Integrationen, Datenmodell, Security, NFRs und den Pilotplan. Außerdem ziehe ich die Herstellerdokumente zur Schranken-API.

V: Bitte auch ein Kapitel zu Edge-Hardware-Empfehlungen: Formfaktor, Redundanz, Mindestanforderungen.

A: Kommt rein. Ich frage außerdem unser Legal wegen DSFA-Vorlagen und TOMs.

V: Perfekt. Ich bereite die Präsentation für den Lenkungskreis vor.

---

K: Interne Nachbesprechung (ohne Anbieter): Das Gespräch war gut. Wichtig ist, dass wir die Pilotstandorte sauber auswählen und unser Team frühzeitig einbinden.

K: Ich informiere die Geschäftsführung und den Datenschutz. Wir brauchen ein Projektteam: Technik, Backoffice, Kassenteam, Vertrieb. Außerdem einen Projektleiter.

K: Ich sammle die Datenexporte und prüfe mit der Buchhaltung die SEPA-Themen. Bei den Herstellern frage ich API-Dokumente an.

---

V: (Eine Woche später) Guten Morgen, Herr Weber. Wir haben das Zielbilddokument und die Pilotplanung fertig. Dürfen wir durchgehen?

K: Gern. Ich habe die Unterlagen erhalten. Bitte starten Sie mit der Architektur.

A: Architekturübersicht: Mandantenfähige Cloud-Plattform in EU-Region, Microservices für CRM, Billing, Pricing, Integrationen. Kafka-ähnlicher Event-Bus. Edge-Komponenten an Standorten mit Konnektoren und lokalem Cache. Datenhaltung: Relationale DB für CRM/Transaktionen, Object Storage für Belege, Time-Series/Columnar für Analytics. Auth über OIDC, RBAC. Monitoring via zentralem Stack.

K: Klingt konsistent. Wie sieht die Deployment-Strategie aus?

A: IaC mit Terraform/Helm, Blue-Green-Deployments, Canary für kritische Services. Edge-Updates OTA, gestaffelt nach Standortgruppen.

V: Integrationen im Pilot: Hersteller Y (REST), Hersteller X (Kasse), Hersteller Z (Kasse), FTP-Controller. PSP QPay. E-Mail/SMS. Optional SSO für Mitarbeiter.

K: Zeitplan?

A: Woche 1–2: Kickoff, Datenexports, Integrations-Discovery. Woche 3–5: Edge-Setup, Konnektoren, CRM-Basiskonfiguration. Woche 6–7: Billing/PSP. Woche 8: Pricing/Produkte. Woche 9: Dashboards. Woche 10: UAT. Woche 11: Go-Live Standort A. Woche 12: Go-Live Standort B + Hypercare.

K: Ambitioniert, aber ok. Risiken aus Ihrer Sicht?

V: Datenqualität und FTP-Controller. Gegenmaßnahmen haben wir dokumentiert. Außerdem Change-Management.

K: Kosten?

V: Setup X €, monatlich Y € für die zwei Standorte plus Transaktionsanteil. Reservierungen/Dynamic Pricing als Modul Z € monatlich ab Phase 2. Edge-Hardware separat.

K: In Ordnung. Wir geben grünes Licht für den Piloten, vorbehaltlich DSFA.

A: Wir starten parallel mit der DSFA und den TOMs.

V: Super. Dann legen wir los.

---

V: Projekt-Kickoff (mit Team beider Seiten)

V: Willkommen zum Kickoff. Ziele: 1) Gemeinsames Verständnis festigen, 2) Rollen definieren, 3) Plan bestätigen, 4) Risiken managen, 5) Nächste Schritte.

K: Wir haben unser Projektteam dabei. Technik (Lisa), Backoffice (Armin), Kassenteam (Nora), Vertrieb (Sabine), Datenschutz (Dr. Keller).

A: Von uns Architektur (Lea), Integration (Tom), Data/BI (Sofia), Billing (Martin), Security (Jannik), PM (Eva).

V: Regeln: Wöchentliche Status-Calls, JIRA-Board, Confluence-Dokumentation, Entscheidungslog. Go-Live-Kriterien sind definiert. Changes via CR-Prozess.

K: Einverstanden.

A: Wir starten mit der Datenerhebung. Bitte stellen Sie Exporte wie besprochen bereit. Wir liefern Validierungsreports in Woche 2.

K: Wird erledigt.

---

K: Daten-Workshop

K: Hier sind die Exporte. Wir sehen Dubletten und fehlende Kennzeichen bei etwa 12% der Verträge.

A: Unsere Voranalyse bestätigt das. Vorschlag: Kundenkommunikation zur Datenaktualisierung, mit einfachem Portal-Link zur Pflege. Parallel heuristische Ergänzung, wo möglich.

K: Einverstanden. Wir formulieren Anschreiben.

V: Wie viele offene Posten?

K: 180, verteilt auf die letzten fünf Monate. Mahnstatus uneinheitlich.

A: Wir normalisieren Mahnstatus und setzen die Mahnengine ab Go-Live neu auf. Historische Posten bleiben in Alt-System, aber werden in einem Lesemodus referenziert.

---

A: Integrations-Workshop

A: Hersteller Y-API getestet, OK. Hersteller X-Kasse: Events und Settlement erreichbar. Hersteller Z: CSV-Exporte für Kassenumsätze vorhanden. FTP-Controller: Whitelist per CSV-Sync möglich, Polling alle fünf Minuten, Differenzlisten empfohlen.

K: Können wir beim FTP-Controller ein schnelleres Sync erreichen?

A: Wir optimieren über kleine Delta-Dateien und reduzieren Dateigröße durch Token-Listen. Realistisch bleiben 1–2 Minuten. Für kritische Freigaben bieten wir zusätzlich einen manuellen Push.

V: PSP QPay Sandbox eingerichtet?

A: Ja. Tokenisierung funktioniert, Webhooks erreichbar. SEPA-Testläufe geplant.

---

V: Security/Compliance-Workshop

Security (Jannik): Bedrohungsmodell: Edge kompromittiert, API-Missbrauch, Insider. Maßnahmen: Zero-Trust-Prinzipien, mTLS, signierte Firmware, rollenbasierter Zugriff, SIEM-Integration, Alerting. Datenschutz: DSFA in Arbeit, Datenminimierung, Retention-Policies, Lösch- und Exportfunktionen.

Dr. Keller: Bitte dokumentieren Sie die Rechtsgrundlage für Kennzeichenerkennung bei Dauerparker vs. Kurzparker, und sorgen Sie für transparente Information.

Jannik: Kommt in die DSFA und ins Verzeichnis der Verarbeitungstätigkeiten.

---

A: BI/Reporting-Workshop

Sofia: Standard-Dashboards sind vorbereitet: Auslastung, Umsatz, Störungen, Mahnwesen. Wir definieren Dimensionen und Metriken. Zusätzlich Ad-hoc-Abfragen per SQL für Analysten.

K: Visualisierung in unserem CI wäre schön.

Sofia: Wir können ein weißgelabeltes Theme anwenden.

---

V: Fortschritt Woche 4

V: Edge-Boxen geliefert, Standort A installiert. Konnektoren laufen im Testmodus. Erste Entitlements gesynct, Roundtrip-Zeiten stabil. Kasse X verbunden. Hersteller Y-API End-to-End getestet.

K: Sehr gut. Was ist mit Standort B und FTP?

A: Edge installiert, FTP-Sync konfiguriert, Deltas funktionieren. Wir beobachten 90–120 Sekunden bis zur Ankunft an Controller. Akzeptabel für den Pilot.

K: In Ordnung.

---

V: Fortschritt Woche 6

V: PSP angebunden, SEPA-Mandate importiert für Testkunden, Kreditkarten-Token aktiv. Erste Rechnungen in Sandbox erzeugt. Mahnlauf getestet.

K: Kurzer Hinweis: Unsere Buchhaltung benötigt eine spezifische CSV-Struktur.

A: Wir passen den Export an und dokumentieren Mapping.

---

V: UAT-Vorbereitung

V: Testfälle sind im System. Wir brauchen Ihre Teammitglieder für die Rollen-Tests.

K: Team ist eingeplant. Bitte Schulungsmaterial bereitstellen.

A: E-Learning-Module und QRCs sind geliefert.

---

V: UAT-Session

Nora (Kassenteam): Ich teste Quittungssuche – funktioniert. Bitte Suchfeld auch nach Teilkennzeichen.

A: Machen wir, mit Hinweis auf Datenschutz (nur befugte Rollen).

Lisa (Technik): Ticketanlage bei Kameraausfall – Ticket erzeugt, Priorität korrekt. Bitte Alarm auch an Pager.

A: Integrieren wir.

Armin (Backoffice): Vertragsanlage – SEPA-Hinweis sichtbar, Kennzeichenvalidierung gut. Bitte Plausibilitätscheck für Adresse.

A: Fügen wir hinzu.

Sabine (Vertrieb): Firmenkontingente – funktioniert. Ich wünsche mir einen Schnellbericht für Nutzung pro Kostenstelle.

Sofia: Kommt als vordefinierter Report.

---

V: Go-Live Standort A

V: Ab 06:00 Uhr live. Edge stabil, Einfahrten reibungslos. Ein Mahnsperre-Fall wurde per Kulanz gelöst. Monitoring zeigt Latenzen < 30 ms. Drei Supportcalls, alle resolved.

K: Glückwunsch. Kundenfeedback positiv.

---

V: Go-Live Standort B

V: FTP-Controller synchronisiert planmäßig. Eine manuelle Push-Freigabe notwendig. Kassenanbindung stabil. Keine kritischen Incidents.

K: Sehr gut. Bitte KPI-Bericht nach Woche 1.

Sofia: Bericht erstellt. Auslastung +8% ggü. Vorwoche, Umsatz +5%, Störungen -20%.

---

V: Hypercare Woche 1–2

V: 12 Tickets, davon 10 gelöst, 2 offen (Feature-Anfragen). MTTR 1,6 h. Mahnengine hat drei Rücklastschriften korrekt verarbeitet. Fallback QR bei 6 Fällen genutzt.

K: Wir sind zufrieden. Bitte die offenen Features priorisieren.

A: Teil der Phase-2-Planung.

---

K: Abschlussgespräch Pilot

K: Die Ziele wurden erreicht: Zutritt per Kennzeichen zuverlässig, Billing korrekt, Dashboards brauchbar, Team akzeptiert das System. Wir möchten in Phase 2 Reservierungen und dynamische Preise ausrollen, plus EV-Integration.

V: Ausgezeichnet. Wir stellen die Roadmap und ein Angebot zusammen.

A: Wir planen einen A/B-Test für dynamische Preise und ein Partnerportal fürs Hotel-PMS.

K: Einverstanden.

---

V: Phase 2 – Planungssession

V: Ziele: 1) Reservierungsmodul, 2) Dynamic Pricing, 3) EV-Integration, 4) Partnerportale.

K: Reservierungen priorisiert. Bitte No-Show-Handling und Kulanzregeln sauber abbilden.

A: Wir definieren Reservierungsstatus, Pufferzeiten, Zahlungslogiken (Prepaid vs. Postpaid), und Auslastungsabhängigkeit. Pricing-Engine erhält Event-Kontext.

V: EV-Integration: Starten wir mit OCPI zu unserem CPO-Partner.

K: Ja. Abrechnung getrennt, aber konsolidierte Rechnung optional.

A: Wir führen Posten auf, trennen Steuerlogik, zeigen Gesamtsumme auf Sammelrechnung mit klarer Ausweisung.

V: Partnerportale: Hotel-PMS-Integration für Voucher.

K: Wichtig ist, dass Hotels nur ihre Vouchers sehen und verwalten.

A: Mandantenkonzept und Rollen sichern das ab.

---

V: Abschluss der Session

V: Vielen Dank, Herr Weber. Wir freuen uns auf die weitere Zusammenarbeit.

K: Ebenso. Das System hilft uns spürbar.

---

V: Für die nächste Runde würde ich gern unsere UX-Designerin kurz in die Unterhaltung holen, um das Kundenportal und die Kassenterminal-Oberfläche im Dialog zu verfeinern.

UX (Mara): Hallo zusammen! Ich habe Wireframes vorbereitet. Dürfen wir gemeinsam ein paar Flows durchgehen?

K: Sehr gern. Was zeigen Sie zuerst?

UX: Start mit dem Portal-Dashboard für Dauerparker. Oben Status „Aktiv“, nächste Rechnung, Zahlungen. Darunter „Meine Fahrzeuge“ mit Kennzeichen, Bearbeiten-Button. Rechts Benachrichtigungen. Unten Hilfe/Support.

K: Sieht gut aus. Bitte prominenter den Button „Kennzeichen ändern“. Das ist der häufigste Anwendungsfall.

UX: Machen wir. Nächster Flow: „Kennzeichen ändern“. Formular mit altem und neuem Kennzeichen, Gültigkeitsdatum „ab sofort“ oder „ab Datum“. Validierung und Bestätigung. Hinweis, dass Änderung innerhalb weniger Minuten aktiv ist.

K: Bitte ein Info-Tooltip zu „Parallelberechtigungen“, falls Tarif diese erlaubt.

UX: Ergänzen wir kontextsensitiv. Dritter Flow: Rechnungsübersicht. Liste mit Datum, Betrag, Status, Download-PDF, Export-CSV.

K: CSV für Sammelrechnungen gerne auch pro Kostenstelle.

UX: Kommt als Filter. Vierter Flow: Support. Kontaktformular, Themenkacheln, Live-Chat optional. Für sensible Themen verlinken wir Wissensartikel.

K: Live-Chat ist später okay. Starten wir mit Formular und Hotline.

UX: Kassenterminal: Barrierefrei, große Buttons, hoher Kontrast, klare Schritte. Bei Erkennungsproblem: „Kennzeichen falsch? QR scannen oder PIN eingeben“. Sprache umschaltbar.

K: Bitte Screenreader-Kompatibilität und Tastenbedienung.

UX: Eingeplant. Danke!

---

V: Technische Tiefenbohrung – Pricing-Engine Implementierungsdialog

A: Für die Pricing-Engine diskutieren wir Rule-Evaluation und Caching. Wir könnten Regeln in einer DSL speichern. Evaluation bei Anfrage oder Precomputing von Zeitfenstern. Ihre Präferenz?

K: Precomputing für Standardzeiten, aber Möglichkeit zur Ad-hoc-Evaluation bei Events. Wichtig: Keine 500er am Gate.

A: Gates greifen nicht auf die Engine direkt zu, nur Edge. Edge bekommt für relevante Produkte Preistabellen und Multiplikatoren, die lokal evaluiert werden. Cloud rechnet Reservierungen und App-Käufe.

K: Gut. Wie testen wir regelgetriebene Preise?

A: Unit-Tests pro Regel, Integrations-Tests pro Szenario, Golden-Master-Tests für Regression. Zusätzlich Explain-Logs für Support.

K: Und Schutz gegen fehlerhafte Regeln?

A: Regeln benötigen Vier-Augen-Freigabe, haben Gültigkeitsfenster, und Ratenbegrenzungen pro Änderung. Rollback möglich.

---

V: Stakeholder-Interview – Kassenteam

Nora: Wichtig ist, dass ich schnell erkenne, warum eine Schranke nicht öffnet. Liegt es an Zahlung, Sperre oder Technik? Ich brauche klare Hinweise.

A: Wir bauen ein Leitstellen-Panel mit Ursachenbaum. Kundensuche per Kennzeichen oder Ticket.

Nora: Super. Außerdem brauche ich einfache Quittungsdruck-Workflows und Stornoberechtigungen nur mit Supervisor.

V: Notiert.

---

V: Stakeholder-Interview – Technikteam

Lisa: Bitte automatische Alarme mit klarer Priorisierung. Keine Alarme bei jedem kleinen Schluckauf. Heartbeat-Thresholds konfigurierbar.

A: Wir setzen Dämpfung und Korrelationsregeln, z. B. mehrfacher Fehlversuch innerhalb von N Minuten.

Lisa: Für Edge hätte ich gern SSH-losen Support-Zugang mit temporärem Token.

A: Wir nutzen einen Remote-Support-Tunnel mit zeitlich begrenzten, auditierbaren Sessions.

---

V: Incident-Postmortem (Simulation) – „Ausfall Kamera Ost Einfahrt“

K: Was ist passiert?

Lisa: Kamera Ost meldete intermittierende Ausfälle. Confidence sank. System schaltete auf QR-Fallback. Tickets entstanden, Techniker dispatched, Austausch des Netzteils.

A: Kennzahlen: Ausfallzeit 42 Minuten, 17 Fallback-Fälle, kein Blocker. Maßnahmen: Ersatznetzteilpuffer, Alarm-Schwellen angepasst, Dokumentation aktualisiert.

K: Akzeptiert.

---

V: Recht/Datenschutz – Dialog mit Dr. Keller

Dr. Keller: Für Kennzeichenerkennung ist die Zweckbindung kritisch. Kurzparker ohne Registrierung: Daten schnell anonymisieren, außer berechtigter Grund.

A: Retention 14 Tage, Pseudonymisierung bei Speicherung im Event-Store, Re-Identifizierung nur mit berechtigtem Prozess.

Dr. Keller: Informationspflichten an Einfahrten und im Portal. Betroffenenrechte müssen ohne großen Aufwand umsetzbar sein.

A: Wir liefern DSFA-Abschnitt, Vorlagen und Self-Service-Funktionen.

---

V: Finanzen – Gespräch mit CFO

CFO: Wie stabil sind die Prognosen für Running Costs? Wir brauchen Planbarkeit.

V: Fixe Plattformgebühr, standortbezogene Lizenz, variable Transaktionskomponente gedeckelt. Preisgleitklausel nur mit Index.

CFO: Akzeptabel. Bitte TCO über drei Jahre, inklusive Hardware und Schulungen.

V: Kommt.

---

V: Last- und Performancetest – Debrief

A: Wir haben 500 gleichzeitige Edge-Requests simuliert, Latenz blieb < 40 ms. Event-Ingestion 5.000 Events/s, keine Backlogs. Pricing-Engine beantwortete 99.9% < 100 ms. FTP-Sync blieb Bottleneck, aber im Soll.

K: Gut. Bitte regelmäßige Lasttests einplanen.

A: Quartalsweise.

---

V: Zukunftsroadmap – Brainstorming

K: Ideen: Gamification (Punkte), Partner-Ökosystem, City-API-Integration, dynamische Belegungshinweise im Parkhaus, CO2-Reporting.

A: Wir priorisieren Partner-API und CO2-Reporting. Gamification in Q3, City-APIs abhängig von Verfügbarkeit.

V: Einverstanden.

---

V: Operative Woche 8 nach Go-Live – Statuscall

V: KPIs stabil, Kundenzufriedenheit steigt. Mahnquote sinkt. Fünf neue Firmenkunden.

K: Ausgezeichnet. Wir erweitern auf zwei weitere Standorte im nächsten Quartal.

A: Wir planen Rollout-Wellen und Replikation der Edge-Configs.

---

V: Abschlussrunde Phase 2 – Reservierungen live

V: Reservierungen aktiviert. No-Show-Rate 7%, Kulanzregeln greifen. Umsatz +3% durch Dynamic Pricing.

K: Gästezufriedenheit bei Events hoch. QR-Fallback hat sich bewährt.

A: Wir dokumentieren Best Practices und skalierten die Engine auf weitere Standorte.

---

V: Abschlussgespräch (formell)

V: Herr Weber, möchten Sie ein kurzes Statement abgeben?

K: Gern. Die Zusammenarbeit verlief professionell und zielorientiert. Das System hat unsere Kernprozesse modernisiert und die Kundenzufriedenheit erhöht. Wir sehen klare Effizienzgewinne und freuen uns auf die weitere Expansion.

V: Vielen Dank. Wir bleiben dran.

---

Anhang A: Vertiefende Dialoge zu Betriebsprozessen und SOPs

V: Lassen Sie uns exemplarische SOPs im Dialog verankern, damit das Betriebsteam klare Leitlinien hat.

K: Einverstanden. Beginnen wir mit „Notöffnung am Gate“.

A: SOP „Notöffnung am Gate“ – Dialogform

Technik (Lisa): Schranke reagiert nicht, Warteschlange bildet sich. Ich bin vor Ort.

Leitstelle: Prüfen wir zuerst den Edge-Status und Gerätedaten. Edge online, Gate-Controller meldet Fehler 0x12.

Lisa: Bestätigt. Kamera liefert Bild, aber Gate blockiert.

Leitstelle: Notöffnung ist freigegeben? Prüfe Berechtigungen… Supervisor anwesend?

Lisa: Ja, Supervisor vor Ort. Wir starten Notöffnung mit Schlüssel. Zeitpunkt 10:14, Videoaufzeichnung aktiv.

Leitstelle: Protokolliert. Nach Entstörung: Manuelle Schließung, Funktionstest mit Testfahrzeug, Rückmeldung.

Lisa: Erledigt. Gate wieder online um 10:27. Ursache: blockiertes Hindernis. Ticket aktualisiert, Fotos angehängt.

---

SOP „Mahnsperre am Gate – Kulanzentscheidung“ – Dialogform

Kassenteam (Nora): Kunde an Einfahrt, Schranke bleibt zu. Anzeige: „Mahnsperre“. Kunde meldet Zahlung soeben durchgeführt.

Leitstelle: Prüfe PSP-Webhook. Zahlung eingegangen 2 Minuten zuvor. System synchronisiert in 60 Sekunden. Wir können Kulanz-Freigabe erteilen.

Nora: Bitte Freigabe für 15 Minuten.

Leitstelle: Freigabe gesetzt. Event protokolliert. Kunde informiert.

Nora: Schranke öffnet. Alles gut.

---

SOP „Kennzeichen-Falscherkennung“ – Dialogform

Kunde: Schranke öffnete nicht, mein Kennzeichen wurde falsch gelesen.

Support: Bitte scannen Sie den QR am Terminal oder geben Sie den PIN aus Ihrer Bestätigung ein.

Kunde: QR gescannt, Zutritt gewährt.

Support: Danke. Wir korrigieren die Erkennung. Dürfen wir die Bildsequenz für Qualitätsverbesserung DSGVO-konform verwenden?

Kunde: Ja.

Support: Danke, vermerkt. Löschung nach Frist automatisch.

---

Anhang B: Service-Level-Dialoge

V: Definieren wir Reaktions- und Lösungszeiten im Gespräch.

K: Für P1-Incidents (Zutritt an Pilotstandorten gestört) Reaktion 15 Minuten, Lösungsziel 2 Stunden.

V: Wir bestätigen. Für P2 (Degradierter Betrieb) Reaktion 1 Stunde, Lösung 8 Stunden. P3 (Nicht-kritisch) Reaktion 4 Stunden, Lösung 3 Werktage. P4 (Anfrage) innerhalb 5 Werktagen.

K: Akzeptiert. Bitte Monitoring so konfigurieren, dass P1 nicht durch Fehlalarme ausgelöst wird.

A: Wir nutzen Korrelationen und Dämpfung.

---

Anhang C: Datenschutz- und Compliance-Dialoge

Dr. Keller: Betroffenenrechte müssen ohne Medienbruch bedienbar sein. Wie läuft eine Auskunftsanfrage?

A: Im Portal kann ein registrierter Nutzer „Daten exportieren“ anfordern. Für nicht-registrierte Kurzparker bieten wir ein Formular mit Nachweis (Ticket-ID, Zeitraum), danach verifizieren wir. Export erfolgt als JSON/CSV/PDF, sensible Felder maskiert.

Dr. Keller: Löschanfragen?

A: Für registrierte Nutzer Self-Service mit Bestätigung. Für Kurzparker über Formular, wenn keine gesetzlichen Aufbewahrungsgründe entgegenstehen.

---

Anhang D: Erweiterte technische Dialoge – Edge und Resilienz

Integration (Tom): Wie garantieren wir Konsistenz zwischen Cloud-Entitlements und Edge-Cache?

A: Wir verwenden versionsbasierte Deltas mit monoton steigender Sequenz. Edge bestätigt angewendete Versionen. Bei Divergenz wird ein Full-Sync ausgelöst.

Tom: Und bei Netzwerkflaps?

A: Exponentielles Backoff mit Jitter, lokaler Write-Ahead-Log für Events. Nach Wiederanbindung Replay in Reihenfolge, idempotent.

Tom: Wie groß darf der Cache werden?

A: Konfigurierbar; standardmäßig 50.000 Einträge, LRU-Strategie für nicht-kritische Daten. Entitlements immer „pin“-bar.

---

Anhang E: Dialog zur Betrugsprävention – Mustererkennung

Security (Jannik): Wir korrelieren Validierungsvolumina pro Händler mit POS-Transaktionssummen (falls API). Anomalien lösen Review-Cases aus.

K: Gut. Bitte False-Positive-Rate überwachen.

Jannik: Wir kalibrieren Schwellen und führen manuelle Stichproben.

---

Anhang F: Kundenerlebnis – Interviews mit Pilotkunden (zusammengefasst im Dialog)

Kunde 1: Ich mag, dass mein Kennzeichen direkt erkannt wird. Die Quittungen im Portal sind praktisch.

Kunde 2: Einmal war die Kamera bei Regen unzuverlässig, QR hat geholfen.

Kunde 3: Reservierung fürs Event hat funktioniert, Preisinfo war transparent.

Support: Danke für das Feedback. Wir verbessern die Hinweise bei Regenfällen.

---

Anhang G: Change Management – Gesprächsrunde

PM (Eva): Wie stellen wir sicher, dass Prozesse nachhaltig verankert werden?

K: Regelmäßige Short-Trainings, Champions im Team, und klare Ownership.

Eva: Wir etablieren ein Trainingsprogramm und eine Wissensdatenbank mit Suchfunktion.

---

Anhang H: Technische Governance – Architekturboard-Dialog

Lea: Änderungen an Integrationsadaptern laufen über RFCs. Wir verlangen Tests, Sicherheitsreview, und Canary-Rollouts.

K: Klingt gut. Bitte Dokumentation aktuell halten.

Lea: Automatisiert aus dem Code generiert.

---

Anhang I: Erweiterte Roadmap-Dialoge

V: Q3: Gamification, CO2-Report, City-API. Q4: Hotel-PMS-Deep-Link, Partner-API GA. Q1 nächstes Jahr: Vollständige EV-Abrechnung konsolidiert.

K: Bitte CO2-Report priorisieren, ist für unseren Nachhaltigkeitsbericht wichtig.

V: Wird getan.

---

Anhang J: KPI-Review im Dialog – Monat 3

Sofia: Auslastung +12% YoY, Umsatz +9%, No-Show bei Reservierungen 6,5% (Ziel < 7%). Mahnquote -18%. MTTR 1,3 h.

K: Sehr gut. Bitte Ausreißeranalyse für Standort B an Samstagen.

Sofia: Kommt als Deep-Dive-Report.

---

Anhang K: Sicherheitsereignis-Drill – Gespräch

Jannik: Simulierter API-Key-Leak. Maßnahmen: Key-Rotation in 5 Minuten, keine Anomalien auf der Leitung. Lessons Learned: Verstärkte Secret-Scanning-Regeln, zusätzliche Alarme.

K: Gut, dass es schnell ging.

---

Anhang L: Produktstrategie – Dialog mit Vertrieb

V: Wir sehen Nachfrage nach flexiblen Firmenkontingenten mit App-basiertem Gästezugang.

K: Wir testen in zwei Firmen. Wichtig sind einfache Einladungen per E-Mail und zeitlich begrenzte Zugänge.

V: Kommt als Beta.

---

Anhang M: Abschlussnotizen im Gespräch

V: Wir halten fest: Ziele des Piloten erreicht, Phase 2 live, KPIs positiv, Roadmap definiert. Nächster Meilenstein: Erweiterung auf weitere Standorte und CO2-Reporting.

K: Bestätigt. Danke an alle Beteiligten.

---

Anhang N: Erweiterte Integrationsfälle – Herstellerdialoge

Hersteller Y: Unsere API liefert Events im JSON-Format. Rate-Limits 500 RPS pro Standort.

A: Ausreichend. Wir bündeln Ereignisse und verwenden Backpressure. Bitte dokumentieren Sie Retry-Codes und Idempotenzschlüssel.

Hersteller Z: CSV-Exporte werden stündlich generiert.

A: Für den Pilot genügt das für Abgleiche. Für Echtzeit planen wir mittelfristig Webhooks.

---

Anhang O: Qualitätsmanagement – Testdialoge

QA (Mina): Wir benötigen Testdaten für 200 Szenarien: Mahnwesen, Reservierung, Kulanz, FTP-Delta, Edge-Ausfall, PSP-Timeouts.

A: Wir erstellen Fabriken und Anonymisate. E2E-Tests laufen nachts, Ergebnisse im Dashboard.

Mina: Bitte zusätzlich Chaos-Tests an Edge.

A: Kommen rein.

---

Anhang P: Erweiterte Sicherheitsdialoge – Zero-Trust

Jannik: Jeder Service spricht mTLS, Service-Mesh erzwingt Policies. Secrets aus Vault, Rotation automatisiert.

K: Auditierbarkeit?

Jannik: Vollständige Audit-Trails, unveränderlich abgelegt, Zugriff streng reguliert.

---

Anhang Q: Betriebskosten und Skalierung – Dialog

CFO: Wie skalieren Kosten mit Standorten?

V: Linear mit Standortzahl plus geringe variable Kosten pro Transaktion. Mengenrabatte ab 5, 10, 20 Standorten.

CFO: Passt.

---

Anhang R: Partner-Ökosystem – Dialog

V: Für Hotels bieten wir Vouchering via PMS-Add-on.

K: Wichtig: Limitierung pro Buchung und Missbrauchskontrolle.

V: In den Regeln abgebildet.

---

Anhang S: Datenarchitektur – Tiefer Dialog

Sofia: Sternschema: Dimensionen Zeit, Standort, Produkt, Kunde; Fakten: Sessions, Zahlungen, Reservierungen, Störungen. Historisierung SCD2 für Tarife.

K: Bitte klare Definitionen, z. B. was als Session zählt.

Sofia: Dokumentiert im Datenkatalog.

---

Anhang T: Nachhaltigkeit und CO2 – Dialog

K: Wir möchten CO2-Schätzungen je Parkvorgang sehen (Anfahrt, Standzeit), optional.

A: Wir integrieren Emissionsfaktoren als Näherung, anonymisiert, mit Opt-in.

K: Gut.


