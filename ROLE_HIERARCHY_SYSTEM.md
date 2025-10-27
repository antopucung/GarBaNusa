# Role-Based Hierarchy System

## Overview
The GarBaNusa platform now has a comprehensive role-based system with three distinct user roles: **ASN (Staff)**, **Supervisor**, and **Committee**. Each role has specific functionalities and dashboards tailored to their responsibilities.

---

## User Roles & Access

### 1. ASN (Civil Service Staff) - 5 Users
Regular civil servants who can access training, career development, and personal merit tracking.

**Users:**
- **Rina Sari** (user-001) - Analyst
  - Email: `rina.sari@demo.go.id`
  - Reports to: Budi Santoso
  - Merit: 76

- **Ani Wijaya** (user-004) - Senior Analyst  
  - Email: `ani.wijaya@demo.go.id`
  - Reports to: Budi Santoso
  - Merit: 82

- **Ahmad Fauzi** (user-005) - Junior Analyst
  - Email: `ahmad.fauzi@demo.go.id`
  - Reports to: Budi Santoso
  - Merit: 72

- **Sari Indah** (user-006) - Data Specialist
  - Email: `sari.indah@demo.go.id`
  - Reports to: Budi Santoso
  - Merit: 78

- **Dewi Kusuma** (user-007) - Policy Analyst
  - Email: `dewi.kusuma@demo.go.id`
  - Reports to: Budi Santoso
  - Merit: 80

**Dashboard:** `/dashboard`
**Features:**
- ✅ View personal merit score and competencies
- ✅ Access Career GPS with AI-powered recommendations
- ✅ Enroll in training programs
- ✅ Track training progress
- ✅ View career path and targets
- ✅ See supervisor information

---

### 2. Supervisor - 1 User
Team leaders who manage ASN staff members and can monitor their team's performance.

**User:**
- **Budi Santoso** (user-002) - Division Head
  - Email: `budi.santoso@demo.go.id`
  - Unit: Data Analytics Division
  - Team Size: 5 members
  - Merit: 88

**Dashboard:** `/supervisor-dashboard`
**Features:**
- ✅ View all team members (5 ASN staff)
- ✅ Monitor team merit scores and average
- ✅ View individual staff competencies
- ✅ Track team member training progress
- ✅ See staff career progression
- ✅ Identify top performers
- ✅ Recommend staff for promotion
- ✅ Send feedback to team members

**Team Structure:**
```
Budi Santoso (Supervisor)
├── Ani Wijaya (Senior Analyst) - Merit: 82
├── Dewi Kusuma (Policy Analyst) - Merit: 80
├── Sari Indah (Data Specialist) - Merit: 78
├── Rina Sari (Analyst) - Merit: 76
└── Ahmad Fauzi (Junior Analyst) - Merit: 72
```

---

### 3. Committee - 1 User
Merit committee members who evaluate candidates for promotions across the organization.

**User:**
- **Dr. Siti Nurhaliza** (user-003) - Committee Chair
  - Email: `dr.siti@demo.go.id`
  - Unit: BKN Regional Office

**Dashboard:** `/merit-board`
**Features:**
- ✅ View all promotion candidates (ASN + Supervisors)
- ✅ Filter by role (All / Supervisors / ASN Staff)
- ✅ Sort by merit score or name
- ✅ View detailed candidate profiles
- ✅ See organizational hierarchy (who reports to whom)
- ✅ View supervisor's team structure and team average merit
- ✅ See training completion history
- ✅ Access AI-powered merit justification
- ✅ Check for bias in evaluations
- ✅ Add candidates to shortlist
- ✅ Compare candidates
- ✅ Export reports

**View Modes:**
1. **All Candidates** - Shows everyone (ASN + Supervisors + Static candidates)
2. **Supervisors Only** - Shows only users with supervisor role
3. **ASN Staff Only** - Shows only users with ASN role

---

## System Architecture

### Organizational Hierarchy
```
Committee (Dr. Siti)
    ↓ [Evaluates]
Supervisors (Budi Santoso)
    ↓ [Manages]
ASN Staff (Rina, Ani, Ahmad, Sari, Dewi)
```

### Data Flow
1. **ASN completes training** → Competencies updated → Merit score recalculated
2. **Supervisor views team** → Real-time merit scores from live database
3. **Committee reviews candidates** → Sees updated merit + team structure
4. **Career GPS** → Uses live competency data to generate personalized recommendations

---

## Key Features by Role

### For ASN Staff
- **Personal Development:** Training enrollment, progress tracking
- **Career Planning:** AI-powered Career GPS with gap analysis
- **Merit Tracking:** Real-time merit score updates after training completion
- **Transparency:** See who supervises them

### For Supervisors  
- **Team Management:** View all 5 team members in one dashboard
- **Performance Monitoring:** Track individual and team merit scores
- **Development Support:** See who needs training, who's progressing
- **Recognition:** Identify and recommend top performers

### For Committee
- **Comprehensive View:** See all candidates across the organization
- **Role-Based Filtering:** Separate view for supervisors vs. ASN staff
- **Hierarchy Awareness:** Understand reporting structures
- **Team Context:** For supervisors, see their team's performance
- **Fair Evaluation:** AI bias checking and justification

---

## Technical Implementation

### User Data Structure
```json
{
  "id": "user-001",
  "name": "Rina Sari",
  "role": "asn",
  "supervisorId": "user-002",  // Links to supervisor
  "competencies": { ... },
  "meritScore": 76,
  "trainingCompleted": [],
  "certificationsEarned": []
}
```

### Live Database Integration
- Uses `localStorage` for persistent data
- `initializeLiveDatabase()` - Sets up initial data
- `getUserProfile()` - Fetches current user data
- `getAllUserProfiles()` - Gets all users (for supervisor/committee)
- `getCandidatesWithLiveData()` - Merges static + live data
- `updateUserCompetencies()` - Updates after training completion

### Dashboard Routing
```javascript
// Automatic role-based routing
if (user.role === 'supervisor') → '/supervisor-dashboard'
if (user.role === 'committee') → '/merit-board'  
if (user.role === 'asn') → '/dashboard'
```

---

## Login Credentials (Demo)

### ASN Staff
- `rina.sari@demo.go.id` / `demo123`
- `ani.wijaya@demo.go.id` / `demo123`
- `ahmad.fauzi@demo.go.id` / `demo123`
- `sari.indah@demo.go.id` / `demo123`
- `dewi.kusuma@demo.go.id` / `demo123`

### Supervisor
- `budi.santoso@demo.go.id` / `demo123`

### Committee
- `dr.siti@demo.go.id` / `demo123`

---

## Workflow Examples

### 1. ASN Training & Merit Update
1. Rina logs in → Dashboard
2. Enrolls in "Leadership Essentials" training
3. Completes all modules
4. Merit score updates: 76 → 79 (+3)
5. Competencies updated: Leadership 50 → 75 (+25)
6. Budi (supervisor) sees updated merit on his dashboard
7. Committee sees updated merit on Merit Board

### 2. Supervisor Team Review
1. Budi logs in → Supervisor Dashboard
2. Views all 5 team members ranked by merit
3. Clicks on Ani Wijaya (top performer)
4. Sees her competencies, training history, career progress
5. Recommends Ani for promotion
6. Committee receives recommendation

### 3. Committee Evaluation
1. Dr. Siti logs in → Merit Board
2. Filters to "Supervisors Only"
3. Sees Budi Santoso with Merit 88
4. Views his profile: sees his 5 team members
5. Team average merit: 77.6
6. Reviews AI justification and bias check
7. Adds Budi to promotion shortlist

---

## Integration Points

### Career GPS
- **ASN:** Uses their own competencies for gap analysis
- **Supervisor:** Can access Career GPS (shows path to Director)
- Recommendations update based on completed trainings

### Merit Calculation
- Automatically recalculates after training completion
- Factors: Competencies (weighted) + Training bonus
- Live updates visible to all roles

### Training System
- ASN can enroll and complete trainings
- Completion triggers competency updates
- History visible to supervisors and committee

---

## Future Enhancements

1. **For Supervisors:**
   - Send training recommendations to team members
   - Approve/reject training requests
   - Performance review forms
   - Team analytics dashboard

2. **For Committee:**
   - Comparison tool (side-by-side candidates)
   - Promotion workflow management
   - Historical promotion data
   - Export detailed reports

3. **For ASN:**
   - Peer-to-peer feedback
   - Mentorship matching
   - Skills endorsements
   - Career milestone notifications

---

## Notes

- All passwords are `demo123` for demo purposes
- Live database persists in browser localStorage
- Merit scores update in real-time across all dashboards
- The system respects the organizational hierarchy (ASN → Supervisor → Committee)
