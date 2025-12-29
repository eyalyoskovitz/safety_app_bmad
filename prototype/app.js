/**
 * Safety First - Prototype Shared JavaScript
 * Mock data, session storage, utility functions
 */

// ===========================
// Mock Data - Pre-loaded Incidents
// ===========================
function getMockIncidents() {
    return [
        {
            id: 'mock_001',
            location: 'loading_dock',
            severity: 'major',
            reporterName: 'יוסי כהן',
            isAnonymous: false,
            description: 'שלולית מים גדולה ליד רציף הטעינה. קיים סכנה להחלקה. השלולית נמצאת שם כבר מספר ימים.',
            incidentDate: '2025-12-27T08:30:00',
            photoUrl: null,
            status: 'resolved',
            assignedTo: 'דנה לוי',
            assignedAt: '2025-12-27T09:00:00',
            resolutionNotes: 'הוחלף כיסוי הניקוז - כרטיס תחזוקה #4521',
            resolvedAt: '2025-12-27T14:30:00',
            createdAt: '2025-12-27T08:35:00'
        },
        {
            id: 'mock_002',
            location: 'production_line',
            severity: 'near_miss',
            reporterName: null,
            isAnonymous: true,
            description: 'מלגזה כמעט פגע בעובד. הנהג לא שם לב והעובד קפץ הצידה בזמן.',
            incidentDate: '2025-12-27T10:15:00',
            photoUrl: null,
            status: 'assigned',
            assignedTo: 'משה ישראלי',
            assignedAt: '2025-12-27T11:00:00',
            createdAt: '2025-12-27T10:20:00'
        },
        {
            id: 'mock_003',
            location: 'warehouse',
            severity: 'critical',
            reporterName: 'שרה מזרחי',
            isAnonymous: false,
            description: 'מדף במחסן קרס תחת משקל יתר. נפלו קרטונים כבדים. למזלנו לא היה אף אחד במקום.',
            incidentDate: '2025-12-26T15:45:00',
            photoUrl: null,
            status: 'new',
            createdAt: '2025-12-26T16:00:00'
        },
        {
            id: 'mock_004',
            location: 'production_line',
            severity: 'minor',
            reporterName: 'אבי כהן',
            isAnonymous: false,
            description: 'כבל חשמלי לא מסודר על הרצפה. מישהו יכול להיתקל בו.',
            incidentDate: '2025-12-26T09:20:00',
            photoUrl: null,
            status: 'resolved',
            assignedTo: 'רונן דוד',
            assignedAt: '2025-12-26T10:00:00',
            resolutionNotes: 'הכבל סודר ונקבע לקיר',
            resolvedAt: '2025-12-26T13:00:00',
            createdAt: '2025-12-26T09:30:00'
        },
        {
            id: 'mock_005',
            location: 'parking',
            severity: 'near_miss',
            reporterName: null,
            isAnonymous: true,
            description: 'חניה כפולה חוסמת גישה לרכב חירום. יש לאכוף את כללי החניה.',
            incidentDate: '2025-12-25T12:00:00',
            photoUrl: null,
            status: 'assigned',
            assignedTo: 'דנה לוי',
            assignedAt: '2025-12-25T13:00:00',
            createdAt: '2025-12-25T12:10:00'
        },
        {
            id: 'mock_006',
            location: 'warehouse',
            severity: 'major',
            reporterName: 'דוד משה',
            isAnonymous: false,
            description: 'תאורה לא תקינה באזור המחסן הצפוני. קשה לראות בלילה ויש סכנה של פגיעה.',
            incidentDate: '2025-12-25T20:30:00',
            photoUrl: null,
            status: 'new',
            createdAt: '2025-12-25T21:00:00'
        },
        {
            id: 'mock_007',
            location: 'cafeteria',
            severity: 'minor',
            reporterName: null,
            isAnonymous: true,
            description: 'רצפה רטובה בכניסה לחדר האוכל. אין שלט אזהרה.',
            incidentDate: '2025-12-24T13:15:00',
            photoUrl: null,
            status: 'resolved',
            assignedTo: 'משה ישראלי',
            assignedAt: '2025-12-24T14:00:00',
            resolutionNotes: 'הוסף שלט אזהרה קבוע',
            resolvedAt: '2025-12-24T15:30:00',
            createdAt: '2025-12-24T13:20:00'
        },
        {
            id: 'mock_008',
            location: 'production_line',
            severity: 'unknown',
            reporterName: 'רחל אברהם',
            isAnonymous: false,
            description: 'צליל מוזר מהמכונה ליד עמדה 3. לא בטוחה אם זה מסוכן אבל נשמע לא תקין.',
            incidentDate: '2025-12-24T08:00:00',
            photoUrl: null,
            status: 'assigned',
            assignedTo: 'רונן דוד',
            assignedAt: '2025-12-24T09:00:00',
            createdAt: '2025-12-24T08:15:00'
        }
    ];
}

// ===========================
// Session Storage - New Incidents
// ===========================
function getNewIncidents() {
    const stored = sessionStorage.getItem('newIncidents');
    return stored ? JSON.parse(stored) : [];
}

function saveNewIncident(incident) {
    const newIncidents = getNewIncidents();
    newIncidents.push(incident);
    sessionStorage.setItem('newIncidents', JSON.stringify(newIncidents));
}

function updateIncident(updatedIncident) {
    // Check if it's a mock incident
    const mockIncidents = getMockIncidents();
    const isMock = mockIncidents.find(inc => inc.id === updatedIncident.id);

    if (isMock) {
        // Store mock incident updates separately
        const mockUpdates = JSON.parse(sessionStorage.getItem('mockUpdates') || '{}');
        mockUpdates[updatedIncident.id] = updatedIncident;
        sessionStorage.setItem('mockUpdates', JSON.stringify(mockUpdates));
    } else {
        // Update in new incidents
        const newIncidents = getNewIncidents();
        const index = newIncidents.findIndex(inc => inc.id === updatedIncident.id);
        if (index !== -1) {
            newIncidents[index] = updatedIncident;
            sessionStorage.setItem('newIncidents', JSON.stringify(newIncidents));
        }
    }
}

function findIncidentById(incidentId) {
    // Check mock incidents first (with updates)
    const mockIncidents = getMockIncidents();
    const mockUpdates = JSON.parse(sessionStorage.getItem('mockUpdates') || '{}');

    const mockIncident = mockIncidents.find(inc => inc.id === incidentId);
    if (mockIncident) {
        // Return updated version if exists
        return mockUpdates[incidentId] || mockIncident;
    }

    // Check new incidents
    const newIncidents = getNewIncidents();
    return newIncidents.find(inc => inc.id === incidentId);
}

// Get all incidents with updates applied
function getAllIncidentsWithUpdates() {
    const mockIncidents = getMockIncidents();
    const mockUpdates = JSON.parse(sessionStorage.getItem('mockUpdates') || '{}');
    const newIncidents = getNewIncidents();

    // Apply updates to mock incidents
    const updatedMockIncidents = mockIncidents.map(inc =>
        mockUpdates[inc.id] || inc
    );

    return [...updatedMockIncidents, ...newIncidents];
}

// ===========================
// Utility Functions (used by HTML pages)
// ===========================

// These are intentionally global for easy use in inline scripts
// (throwaway code, so not worried about global namespace pollution)

window.getMockIncidents = getMockIncidents;
window.getNewIncidents = getNewIncidents;
window.saveNewIncident = saveNewIncident;
window.updateIncident = updateIncident;
window.findIncidentById = findIncidentById;
window.getAllIncidentsWithUpdates = getAllIncidentsWithUpdates;

// ===========================
// Debug Helper (Console)
// ===========================
console.log('🛡️ Safety First Prototype Loaded');
console.log('Mock incidents:', getMockIncidents().length);
console.log('New incidents:', getNewIncidents().length);

// Log user session if logged in
if (sessionStorage.getItem('isLoggedIn')) {
    console.log('Logged in as:', {
        role: sessionStorage.getItem('userRole'),
        name: sessionStorage.getItem('userName')
    });
}
