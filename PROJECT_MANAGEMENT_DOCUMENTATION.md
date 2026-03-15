# E-Mentor Digital Platform - Frontend Application

## Funding Application for Digital Education Platform Development

---

**Document Version:** 1.0
**Date:** January 2026
**Project Duration:** 12 months

---

## Table of Contents

- [0. Executive Summary](#0-executive-summary)
- [1. Technical and Scientific Description](#1-technical-and-scientific-description)
  - [1.1 Project Topic and Practical Relevance](#11-project-topic-and-practical-relevance)
  - [1.2 Contribution Beyond the State of the Art](#12-contribution-beyond-the-state-of-the-art)
  - [1.3 Project Objectives and Outcomes](#13-project-objectives-and-outcomes)
  - [1.4 Original and Innovative Contributions](#14-original-and-innovative-contributions)
  - [1.5 Inter-, Multi-, or Trans-disciplinary Characteristics](#15-inter--multi--or-trans-disciplinary-characteristics)
- [2. Impact and Dissemination](#2-impact-and-dissemination)
  - [2.1 Dissemination and Exploitation of Results](#21-dissemination-and-exploitation-of-results)
  - [2.2 Possible Applications with Market Potential](#22-possible-applications-with-market-potential)
  - [2.3 Estimated Improvements in Quality of Life](#23-estimated-improvements-in-quality-of-life)
  - [2.4 Project Integration in Development Strategy](#24-project-integration-in-development-strategy)
  - [2.5 Intellectual Property Protection](#25-intellectual-property-protection)
- [3. Consortium Description](#3-consortium-description)
  - [3.1 Project Director](#31-project-director)
  - [3.2 Consortium Structure](#32-consortium-structure)
  - [3.3 Partner Research Team Leaders](#33-partner-research-team-leaders)
  - [3.4 Partner Team Structure](#34-partner-team-structure)
  - [3.5 Consortium Complementarities and Synergies](#35-consortium-complementarities-and-synergies)
- [4. Project Management](#4-project-management)
  - [4.1 Work Plan, Deliverables and Load Balancing](#41-work-plan-deliverables-and-load-balancing)
  - [4.2 Coordination and Task Schedule](#42-coordination-and-task-schedule)
  - [4.3 Available Research Infrastructure](#43-available-research-infrastructure)
  - [4.4 Manpower Allocation](#44-manpower-allocation)
  - [4.5 Project Budget and Partners Share](#45-project-budget-and-partners-share)
- [5. References](#5-references)

---

## 0. Executive Summary

The **E-Mentor Digital Platform** is a comprehensive web-based application designed to revolutionize the educational mentoring landscape in Romania. The platform addresses the critical need for structured, personalized exam preparation tools for students preparing for Bacalaureat (high school graduation exam) and university admission examinations.

**Project Overview:**

The E-Mentor frontend application serves as the primary user interface for a sophisticated digital mentoring ecosystem. Built on modern web technologies including Next.js 13, React 18, and Material-UI v5, the platform provides role-based access control for three distinct user types: Students, Professors, and Administrators.

**Core Functionality:**

- **Student Module:** Personalized dashboards with progress analytics, lesson viewing with integrated PDF reader, interactive quiz system with timed attempts, and comprehensive result tracking
- **Professor Module:** Student management interface, lesson and quiz creation tools (CRUD operations), performance analytics dashboards, calendar-based session scheduling, and integrated payment management
- **Real-Time Features:** WebSocket-based notification system using STOMP protocol, live updates for quiz submissions and calendar events

**Technical Architecture:**

The application employs a microservices architecture communicating with four backend services:
- Profile Service (user management, payments, events)
- Quiz Service (quiz CRUD, attempts, grading)
- Lesson Service (lesson CRUD, file management)
- Notification Service (real-time events)

Authentication is handled through Keycloak OAuth2/OpenID Connect integration, with CASL library providing fine-grained role-based access control. The frontend utilizes Redux Toolkit with persistence for state management and OpenAPI-generated TypeScript clients for type-safe API communication.

**Expected Outcomes:**

Upon completion, the platform will provide Romanian students with a centralized exam preparation tool, enable professors to efficiently manage their tutoring practice, and create a sustainable business model through subscription-based access for educators.

**Target Market:** Approximately 150,000 annual Bacalaureat candidates, 100,000 university admission candidates, and 10,000+ active private tutors in Romania.

---

## 1. Technical and Scientific Description

### 1.1 Project Topic and Practical Relevance

#### Problem Statement

Romanian students preparing for critical examinations (Bacalaureat, university admissions) face several challenges:

1. **Fragmented Learning Resources:** Educational materials are scattered across multiple platforms, textbooks, and tutoring sessions without centralized access
2. **Limited Progress Tracking:** Students lack tools to monitor their preparation progress and identify knowledge gaps
3. **Inefficient Tutor-Student Communication:** Scheduling, payment, and content delivery between tutors and students relies on ad-hoc methods
4. **Absence of Standardized Assessment:** No unified platform exists for practice examinations with automated grading and analytics

#### Solution Architecture

The E-Mentor platform addresses these challenges through a unified digital ecosystem:

```
/src
├── @core/                    # Core infrastructure components
│   ├── axios/               # HTTP client with interceptors
│   ├── components/auth/     # Authentication guards (ACL, Auth, Guest)
│   ├── context/             # Global contexts (Settings)
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Layout components (Vertical, Horizontal, Blank)
│   └── theme/               # Material-UI theme configuration
├── configs/                  # Application configuration
│   ├── acl.js               # CASL role-based access rules
│   ├── auth.js              # Keycloak authentication endpoints
│   └── themeConfig.js       # UI theme settings
├── context/                  # Application-level contexts
│   ├── AuthContext.js       # User authentication state
│   └── WebSocketContext.js  # Real-time notification handling
├── generated/                # OpenAPI-generated API clients
│   ├── profile-service-client/
│   ├── quiz-service/
│   └── lesson-service/
├── navigation/               # Role-based navigation configuration
├── pages/                    # Next.js page routes (40+ pages)
├── services/                 # Business logic services
├── store/                    # Redux Toolkit state management
│   └── apps/                # Feature-specific slices
└── views/                    # Reusable view components
```

#### Practical Relevance

The platform directly correlates with the digital transformation initiative in Romanian education by:

- Providing accessible, 24/7 learning resources
- Enabling data-driven educational insights
- Supporting the gig economy for private tutors
- Reducing geographical barriers to quality education

### 1.2 Contribution Beyond the State of the Art

#### Current State of the Art

Existing educational platforms in Romania primarily offer:
- Static content delivery (PDF repositories)
- Basic video conferencing for tutoring sessions
- Simple multiple-choice testing without analytics

#### Platform Innovations

**1. Smart Student Caching System**

The platform implements a sophisticated 3-tier lookup mechanism for efficient data retrieval:

```javascript
// Implementation in src/store/apps/user/index.js
export const fetchStudentsByIds = createAsyncThunk(
  'appUsers/fetchStudentsByIds',
  async (studentIds, { getState }) => {
    // Tier 1: Check local cache (active students)
    const cachedStudents = getState().user.data.filter(...)

    // Tier 2: Refresh from server if cache miss
    if (missingIds.length > 0) {
      await dispatch(fetchData())
    }

    // Tier 3: Batch API call for remaining
    const response = await api.getStudentsByIds(remainingIds)
    return response.data
  }
)
```

**2. OpenAPI-First Development**

All API clients are generated from OpenAPI specifications ensuring:
- Type-safe API communication
- Automatic client regeneration on schema changes
- Centralized API documentation

**3. CASL-Based Fine-Grained Access Control**

```javascript
// Implementation in src/configs/acl.js
const defineRulesFor = (role, profileCompleted) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  can('read', 'common-view')  // All authenticated users

  if (role === 'PROFESSOR') {
    if (profileCompleted) {
      can(['read'], 'professor-pages')
    } else {
      can(['read'], 'professor-profile-complete-page')
    }
  } else if (role === 'STUDENT') {
    if (profileCompleted) {
      can(['read'], 'student-pages')
    } else {
      can(['read'], 'student-profile-complete-page')
    }
  }

  return rules
}
```

**4. Real-Time WebSocket Architecture**

Notification delivery using STOMP protocol over WebSocket with automatic reconnection and fallback to SockJS.

### 1.3 Project Objectives and Outcomes

#### Primary Objectives

| ID | Objective | Measurable Outcome | Success Criteria |
|----|-----------|-------------------|------------------|
| O1 | Student Learning Module | Functional lesson viewer, quiz system | Students can view lessons and complete quizzes |
| O2 | Professor Management Module | Lesson/quiz CRUD, student management | Professors can manage content and students |
| O3 | Payment Integration | Stripe subscriptions, wallet system | Successful payment processing |
| O4 | Real-Time Features | Notifications, calendar sync | < 500ms notification delivery |
| O5 | Performance Optimization | < 3s initial load time | Core Web Vitals passing |
| O6 | Production Deployment | CI/CD pipeline, monitoring | 99.9% uptime target |

#### Student Module Outcomes (ACL Subject: `student-pages`)

| Route | Page | Functionality |
|-------|------|---------------|
| `/dashboards/analytics` | Student Dashboard | Progress overview, quiz statistics, recent activity |
| `/lessons` | Lesson Browser | List assigned lessons with filtering and search |
| `/lesson/[id]` | Lesson Viewer | PDF rendering with react-pdf, progress tracking |
| `/quizzes` | Quiz List | Available quizzes with status indicators |
| `/quiz-attempt/[id]` | Quiz Interface | Timed quiz taking with answer persistence |
| `/review-attempt/[id]` | Attempt Review | Post-quiz answer review with correct answers |

#### Professor Module Outcomes (ACL Subject: `professor-pages`)

| Route | Page | Functionality |
|-------|------|---------------|
| `/acl` | Professor Dashboard | Active students, recent activity, payment summary |
| `/all-lessons` | Lesson Management | Create, edit, delete, assign lessons |
| `/student-lessons` | Lesson Results | Track student lesson completion progress |
| `/all-quizzes` | Quiz Management | Create, edit, delete, assign quizzes |
| `/student-results` | Quiz Results | View all student quiz attempts and scores |
| `/apps/calendar` | Calendar | Schedule mentoring sessions with students |
| `/apps/user/list` | Student Management | Add, remove, manage student relationships |
| `/subscription-required` | Subscription Gate | Stripe payment for platform access |

### 1.4 Original and Innovative Contributions

#### 1. Multi-Service API Client Factory Pattern

```typescript
// Pattern implementation in src/generated/
const createServiceAxios = (baseURL: string) => {
  const serviceAxios = axios.create({
    baseURL,
    timeout: baseApiClient.defaults.timeout
  })

  // Share interceptors for consistent auth handling
  serviceAxios.interceptors.request = baseApiClient.interceptors.request
  serviceAxios.interceptors.response = baseApiClient.interceptors.response

  return serviceAxios
}
```

#### 2. Token Verification Pipeline

Automatic JWT token validation and refresh before expiration:

```javascript
// Implementation in src/@core/axios/token-validator.js
const validateAndRefreshToken = async () => {
  const token = localStorage.getItem('accessToken')
  const decoded = jwt_decode(token)

  // Refresh 5 minutes before expiry
  if (decoded.exp - Date.now()/1000 < 300) {
    return await refreshToken()
  }
  return token
}
```

#### 3. Responsive Quiz Interface

Adaptive UI based on device capabilities:
- **Desktop:** MUI DataGrid with advanced filtering, sorting, pagination
- **Mobile:** Card-based layout with touch-optimized interactions

#### 4. Professor Subscription Guard

```javascript
// Implementation in src/@core/components/auth/ProfessorSubscriptionGuard.js
const ProfessorSubscriptionGuard = ({ children }) => {
  const [hasSubscription, setHasSubscription] = useState(null)

  useEffect(() => {
    // Check cached subscription (2-hour TTL)
    const cached = localStorage.getItem('subscriptionStatus')
    if (cached && Date.now() - cached.timestamp < 7200000) {
      setHasSubscription(cached.active)
      return
    }

    // Fetch fresh status
    fetchSubscriptionStatus().then(status => {
      setHasSubscription(status.active)
      cacheSubscriptionStatus(status)
    })
  }, [])

  if (!hasSubscription) {
    return <Navigate to="/subscription-required" />
  }

  return children
}
```

### 1.5 Inter-, Multi-, or Trans-disciplinary Characteristics

The E-Mentor platform integrates multiple technical and domain disciplines:

| Domain | Technologies | Implementation Details |
|--------|-------------|------------------------|
| **Frontend Engineering** | React 18, Next.js 13, TypeScript | SPA with SSR capabilities, component-based architecture |
| **UI/UX Design** | Material-UI v5, Emotion CSS-in-JS | Vuexy admin template customization, responsive design |
| **Authentication & Security** | Keycloak, JWT, CASL | OAuth2/OIDC flow, role-based access control |
| **Real-Time Systems** | WebSocket, STOMP, SockJS | Bidirectional communication for notifications |
| **Payment Processing** | Stripe | Subscription management, payment intents |
| **API Design** | OpenAPI 3.0, REST | Code generation, type-safe clients |
| **State Management** | Redux Toolkit, Redux Persist | Centralized state with offline persistence |
| **Performance Monitoring** | Elastic APM RUM | Frontend performance tracking, error capture |
| **Internationalization** | i18next, react-i18next | Multi-language support infrastructure |

**Interdisciplinary Integration:**

The platform demonstrates cross-domain integration through:

1. **Education + Technology:** Pedagogical principles applied to quiz design and progress tracking
2. **Security + UX:** Seamless authentication flow without compromising security
3. **Finance + SaaS:** Subscription-based model with wallet management for tutors
4. **Real-Time + Reliability:** WebSocket with fallback mechanisms for diverse network conditions

---

## 2. Impact and Dissemination

### 2.1 Dissemination and Exploitation of Results

#### Target User Segments

| Segment | Size (Romania) | Characteristics |
|---------|----------------|-----------------|
| Bacalaureat Students | ~150,000/year | High school seniors preparing for graduation exam |
| University Candidates | ~100,000/year | Students preparing for admission examinations |
| Private Tutors | ~10,000 active | Individual educators offering tutoring services |
| Educational Institutions | ~500 potential | Schools and tutoring centers |

#### Dissemination Strategy

**Phase 1: Early Adopter Acquisition (Month 1-6)**
- Direct outreach to private tutors through professional networks
- Social media presence targeting exam preparation communities
- Partnership with educational content creators

**Phase 2: Market Expansion (Month 7-12)**
- School partnership program for bulk student enrollment
- Professor referral incentive system
- Targeted advertising during exam preparation periods (Feb-Jul)

**Phase 3: Platform Ecosystem (Post-Launch)**
- API partnerships with educational content providers
- White-label solutions for tutoring centers
- Mobile application development (iOS/Android)

#### Dissemination Vehicles

| Vehicle | Target | Metrics |
|---------|--------|---------|
| Social Media (Facebook, Instagram) | Students | Reach, Engagement |
| LinkedIn | Professors | Professional connections |
| Educational Forums | Both | Sign-ups, Referrals |
| School Partnerships | Institutions | Bulk enrollments |
| Word of Mouth | Both | NPS Score |

### 2.2 Possible Applications with Market Potential

#### Revenue Model

**Primary Revenue Streams:**

1. **Professor Subscriptions**
   - Monthly: 99 RON (~20 EUR)
   - Yearly: 899 RON (~180 EUR, 25% discount)
   - Features: Unlimited students, all content creation tools

2. **Premium Student Features** (Future)
   - Advanced analytics: 29 RON/month
   - AI-powered recommendations: 49 RON/month
   - Video lesson access: 39 RON/month

3. **Transaction Fees**
   - Platform commission on tutor-student payments: 5-10%

#### Market Size Estimation (Romania)

| Metric | Value | Calculation |
|--------|-------|-------------|
| Total Addressable Market (TAM) | 25M EUR | All education spending on tutoring |
| Serviceable Addressable Market (SAM) | 5M EUR | Online tutoring segment |
| Serviceable Obtainable Market (SOM) | 500K EUR | Year 1 target (10% of SAM) |

#### Expansion Opportunities

- **Geographic:** Moldova, Bulgaria, other Romanian-speaking regions
- **Vertical:** University-level courses, professional certifications
- **Horizontal:** Other examination systems (Cambridge, SAT prep)

### 2.3 Estimated Improvements in Quality of Life

#### For Students

| Current State | With E-Mentor | Improvement |
|---------------|---------------|-------------|
| Scattered study materials | Centralized lesson repository | 50% reduction in material search time |
| No progress tracking | Real-time analytics dashboard | Clear visibility into preparation gaps |
| Fixed tutoring schedules | Flexible self-paced learning | 24/7 access to practice quizzes |
| Manual result tracking | Automated grading and history | Instant feedback on performance |
| Limited tutor access | Direct messaging and scheduling | Improved tutor-student communication |

#### For Professors

| Current State | With E-Mentor | Improvement |
|---------------|---------------|-------------|
| Manual content creation | Structured lesson/quiz builder | 40% reduction in content prep time |
| Paper-based assessments | Digital quiz with auto-grading | Eliminates manual grading |
| Informal payment collection | Integrated payment system | Streamlined financial management |
| Basic student tracking | Comprehensive analytics | Data-driven teaching adjustments |
| Calendar management chaos | Integrated scheduling | Reduced scheduling conflicts |

### 2.4 Project Integration in Development Strategy

#### Backend Services Integration

The frontend application integrates with four microservices:

| Service | Base URL | Functionality |
|---------|----------|---------------|
| Profile Service | `/service2` | User profiles, payments, events, bank accounts |
| Quiz Service | `/service3/quiz` | Quiz CRUD, attempts, results |
| Lesson Service | `/service4` | Lesson CRUD, file management |
| Notification Service | `/service5` | Real-time event delivery |

#### API Specification

```javascript
// From src/apiSpec.js
const PROD_HOST = process.env.NEXT_PUBLIC_PROD_HOST  // https://api.e-mentor.ro
const USER_SERVICE = '/service1/user'
const PROFILE_SERVICE = '/service2'
const QUIZ_SERVICE = '/service3/quiz'
const LESSON_SERVICE = '/service4'
```

#### Technology Roadmap Alignment

| Quarter | Frontend Milestone | Backend Dependency |
|---------|-------------------|-------------------|
| Q1 | Core authentication, ACL | Keycloak deployment |
| Q2 | Student module complete | Quiz/Lesson services |
| Q3 | Professor module complete | Payment service |
| Q4 | Real-time features | Notification service |

### 2.5 Intellectual Property Protection

#### Code Protection Measures

1. **Repository Security**
   - Private GitHub repository with branch protection
   - Required code reviews for all merges
   - Automated security scanning (Dependabot)

2. **Environment Configuration**
   - All secrets stored in `.env` files (not committed)
   - Production secrets in secure vault (AWS Secrets Manager)
   - Environment-specific configurations

3. **API Key Management**
   - Keycloak client secrets rotated quarterly
   - Stripe API keys with restricted permissions
   - Third-party service keys encrypted at rest

#### Intellectual Property Agreement

- All code developed under work-for-hire agreement
- Platform design and branding trademarked
- User-generated content (lessons, quizzes) owned by creators with platform license

---

## 3. Consortium Description

### 3.1 Project Director

**Position:** Lead Frontend Engineer / Technical Lead

**Responsibilities:**
- Overall technical architecture decisions
- Code review and quality assurance
- Sprint planning and task allocation
- Stakeholder communication
- Risk management and mitigation

**Required Qualifications:**
- 5+ years React/Next.js development experience
- Experience with enterprise authentication systems
- Background in educational technology preferred
- Strong understanding of Romanian education system

### 3.2 Consortium Structure

#### Partner Organizations

| Partner | Role | Expertise |
|---------|------|-----------|
| **CO - Coordinating Organization** | Platform Development | Frontend engineering, UI/UX, DevOps |
| **P1 - Backend Services Provider** | API Development | Microservices, database management |
| **P2 - Educational Content Partner** | Content Strategy | Curriculum alignment, pedagogical review |
| **P3 - Payment Processing Partner** | Financial Integration | Stripe integration, compliance |

#### Ongoing Related Projects

| Partner | Project Name | Funding | Duration |
|---------|-------------|---------|----------|
| CO | E-Mentor Backend Services | Self-funded | 2024-2026 |
| CO | Mobile App Development | Planned | 2026-2027 |
| P2 | Bacalaureat Content Library | Ministry of Education | 2023-2025 |

### 3.3 Partner Research Team Leaders

#### Frontend Team Lead (CO)

**Responsibilities:**
- React/Next.js architecture design
- Component library development
- State management implementation
- Performance optimization

**Key Achievements:**
- 5+ years enterprise React development
- Previous EdTech platform experience
- Open-source contributions to Material-UI ecosystem

#### Backend Integration Lead (P1)

**Responsibilities:**
- API client generation and maintenance
- Service integration testing
- Real-time communication implementation

### 3.4 Partner Team Structure

#### Team Composition

| Role | Count | Primary Responsibilities |
|------|-------|-------------------------|
| Frontend Lead | 1 | Architecture, code review, technical decisions |
| Senior UI Developer | 1 | Complex component development, responsive design |
| UI Developer | 2 | Page implementation, component development |
| Integration Developer | 1 | API clients, service communication |
| QA Engineer | 1 | Testing strategy, E2E tests, performance |
| DevOps Engineer | 1 | CI/CD, deployment, monitoring |

### 3.5 Consortium Complementarities and Synergies

#### Technical Synergies

| Domain | CO Contribution | Partner Contribution | Synergy Outcome |
|--------|-----------------|---------------------|-----------------|
| Authentication | Frontend integration | Keycloak deployment | Seamless SSO |
| Payment | UI/UX flows | Stripe backend | Frictionless payments |
| Real-time | WebSocket client | STOMP broker | Live notifications |
| Content | PDF viewer | Content management | Rich learning experience |

#### Knowledge Transfer

- Weekly technical sync meetings between frontend and backend teams
- Shared documentation repository
- Cross-team code review for integration points

---

## 4. Project Management

### 4.1 Work Plan, Deliverables and Load Balancing

The project is organized into 9 Work Packages (WPs) covering the full development lifecycle.

---

#### WP1: Core Infrastructure

**Duration:** Month 1-2
**WP Leader:** Frontend Lead
**Partners Involved:** CO, P1

**Goals:**
- Establish project foundation with authentication and authorization
- Create reusable component library and design system
- Configure state management and API client infrastructure

**Success Indicators:**
- Users can authenticate via Keycloak
- Role-based access control functional
- API calls successful with token management

**Tasks:**

| Task ID | Description | Deliverable | Duration |
|---------|-------------|-------------|----------|
| T1.1 | Next.js 13 project initialization | Configured repository with TypeScript | Week 1 |
| T1.2 | Keycloak integration | Working OAuth2 flow with callback | Week 2-3 |
| T1.3 | CASL ACL implementation | Role-based page protection | Week 3-4 |
| T1.4 | Axios client factory | Interceptors for auth, error handling | Week 4-5 |
| T1.5 | Redux store setup | Persisted state with slices structure | Week 5-6 |
| T1.6 | MUI theme customization | Brand-aligned design system | Week 6-8 |

**Key Files:**
- `src/context/AuthContext.js`
- `src/configs/acl.js`
- `src/@core/axios/axiosEmentor.js`
- `src/store/index.js`

**Risks:**
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Keycloak configuration complexity | Medium | High | Engage Keycloak consultant |
| ACL requirements unclear | Low | Medium | Iterative refinement with stakeholders |

---

#### WP2: Student Module

**Duration:** Month 2-4
**WP Leader:** Senior UI Developer
**Partners Involved:** CO

**Goals:**
- Complete student-facing pages with full functionality
- Implement lesson viewing and quiz taking interfaces
- Create student analytics dashboard

**Success Indicators:**
- Students can browse and view assigned lessons
- Quiz attempts save and submit correctly
- Dashboard displays accurate progress data

**Tasks:**

| Task ID | Description | Deliverable | Duration |
|---------|-------------|-------------|----------|
| T2.1 | Student dashboard | Analytics page with charts | Week 1-2 |
| T2.2 | Lessons list page | Filterable lesson grid | Week 2-3 |
| T2.3 | Lesson viewer | PDF rendering with react-pdf | Week 3-4 |
| T2.4 | Quizzes list page | Quiz cards with status | Week 4-5 |
| T2.5 | Quiz attempt interface | Timed questions, answer persistence | Week 5-7 |
| T2.6 | Attempt review page | Correct/incorrect answer display | Week 7-8 |

**Key Files:**
- `src/pages/dashboards/analytics/`
- `src/pages/lessons/index.js`
- `src/pages/quizzes/[[...all]].js`
- `src/pages/quiz-attempt/[...all].js`
- `src/store/apps/quiz/index.js`

**Risks:**
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PDF rendering performance | Medium | Medium | Lazy loading, virtualization |
| Quiz timer synchronization | Low | High | Server-side time validation |

---

#### WP3: Professor Module

**Duration:** Month 3-5
**WP Leader:** Frontend Lead
**Partners Involved:** CO, P1

**Goals:**
- Complete professor-facing pages with CRUD operations
- Implement student management interface
- Create professor dashboard with analytics

**Success Indicators:**
- Professors can create, edit, delete lessons and quizzes
- Student assignment and progress tracking functional
- Dashboard shows relevant metrics

**Tasks:**

| Task ID | Description | Deliverable | Duration |
|---------|-------------|-------------|----------|
| T3.1 | Professor dashboard | Activity feed, metrics cards | Week 1-2 |
| T3.2 | Lesson management | CRUD interface for lessons | Week 2-4 |
| T3.3 | Quiz management | CRUD interface for quizzes | Week 4-6 |
| T3.4 | Student management | Add/remove students, generations | Week 6-7 |
| T3.5 | Results analytics | Performance charts and tables | Week 7-8 |

**Key Files:**
- `src/pages/acl/index.js`
- `src/pages/all-lessons/index.js`
- `src/pages/all-quizzes/[[...all]].js`
- `src/pages/apps/user/list/index.js`
- `src/store/apps/user/index.js`

**Risks:**
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complex form validation | Medium | Low | React Hook Form + Yup schemas |
| Large student lists performance | Medium | Medium | Server-side pagination, virtualization |

---

#### WP4: Calendar and Events

**Duration:** Month 4-6
**WP Leader:** UI Developer
**Partners Involved:** CO, P1

**Goals:**
- Implement calendar interface with FullCalendar
- Enable event CRUD operations
- Support student assignment to events

**Tasks:**

| Task ID | Description | Deliverable | Duration |
|---------|-------------|-------------|----------|
| T4.1 | Calendar page setup | FullCalendar integration | Week 1-2 |
| T4.2 | Event creation | Modal form for new events | Week 2-3 |
| T4.3 | Event editing | Update event details | Week 3-4 |
| T4.4 | Student assignment | Attendee management | Week 4-5 |
| T4.5 | Event notifications | Real-time event reminders | Week 5-6 |

**Key Files:**
- `src/pages/apps/calendar/`
- `src/store/apps/calendar/index.ts`

---

#### WP5: Payment Integration

**Duration:** Month 5-7
**WP Leader:** Integration Developer
**Partners Involved:** CO, P1, P3

**Goals:**
- Implement Stripe subscription flow
- Create manual payment processing for professors
- Build wallet management interface

**Tasks:**

| Task ID | Description | Deliverable | Duration |
|---------|-------------|-------------|----------|
| T5.1 | Subscription page | Stripe checkout redirect | Week 1-2 |
| T5.2 | Subscription guard | ProfessorSubscriptionGuard | Week 2-3 |
| T5.3 | Manual payment wizard | Multi-step payment flow | Week 3-5 |
| T5.4 | Wallet interface | Balance display, history | Week 5-6 |
| T5.5 | Invoice display | Transaction history table | Week 6-7 |

**Key Files:**
- `src/pages/subscription-required/index.js`
- `src/pages/payment-process/`
- `src/services/payment-service.ts`

**Risks:**
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stripe API changes | Low | High | Abstract payment layer |
| Payment compliance | Medium | High | Legal review, PCI compliance |

---

#### WP6: Real-Time Features

**Duration:** Month 6-8
**WP Leader:** Integration Developer
**Partners Involved:** CO, P1

**Goals:**
- Implement WebSocket connection with STOMP protocol
- Create notification UI components
- Handle connection lifecycle and reconnection

**Tasks:**

| Task ID | Description | Deliverable | Duration |
|---------|-------------|-------------|----------|
| T6.1 | WebSocket service | STOMP client implementation | Week 1-2 |
| T6.2 | Connection management | Auto-reconnect, fallback | Week 2-3 |
| T6.3 | Notification bell | UI component with badge | Week 3-4 |
| T6.4 | Toast notifications | Real-time toast display | Week 4-5 |
| T6.5 | Notification persistence | Redux storage, read/unread | Week 5-6 |

**Key Files:**
- `src/@core/axios/WebSocketService.js`
- `src/context/WebSocketContext.js`
- `src/store/apps/notifications/index.js`

---

#### WP7: Performance and Polish

**Duration:** Month 8-10
**WP Leader:** Senior UI Developer
**Partners Involved:** CO

**Goals:**
- Optimize application performance
- Ensure mobile responsiveness
- Implement accessibility features

**Tasks:**

| Task ID | Description | Deliverable | Duration |
|---------|-------------|-------------|----------|
| T7.1 | Smart caching | Implement 3-tier student lookup | Week 1-2 |
| T7.2 | Code splitting | Next.js dynamic imports | Week 2-3 |
| T7.3 | Image optimization | Lazy loading, thumbnails | Week 3-4 |
| T7.4 | Mobile responsiveness | Touch-friendly UI | Week 4-6 |
| T7.5 | Accessibility | ARIA labels, keyboard nav | Week 6-8 |

---

#### WP8: Testing and Quality

**Duration:** Month 9-11
**WP Leader:** QA Engineer
**Partners Involved:** CO

**Goals:**
- Achieve comprehensive test coverage
- Validate all user flows
- Perform security assessment

**Tasks:**

| Task ID | Description | Deliverable | Duration |
|---------|-------------|-------------|----------|
| T8.1 | Unit testing | Component and hook tests | Week 1-3 |
| T8.2 | Integration testing | API client tests | Week 3-5 |
| T8.3 | E2E testing | Cypress/Playwright flows | Week 5-7 |
| T8.4 | Performance testing | Load time benchmarks | Week 7-8 |
| T8.5 | Security audit | Penetration testing | Week 8-9 |

---

#### WP9: Deployment and Monitoring

**Duration:** Month 11-12
**WP Leader:** DevOps Engineer
**Partners Involved:** CO, P1

**Goals:**
- Establish CI/CD pipeline
- Configure production monitoring
- Create operational documentation

**Tasks:**

| Task ID | Description | Deliverable | Duration |
|---------|-------------|-------------|----------|
| T9.1 | CI/CD pipeline | Automated build and deploy | Week 1-2 |
| T9.2 | APM integration | Elastic APM configuration | Week 2-3 |
| T9.3 | Error tracking | Centralized error logging | Week 3-4 |
| T9.4 | Documentation | Technical and API docs | Week 4-5 |
| T9.5 | Runbooks | Operational procedures | Week 5-6 |

**Key Files:**
- `src/pages/_app.js` (APM initialization)

---

#### Work Package Summary Table

| WP | Title | Leader | Person-Months | Start | End |
|----|-------|--------|---------------|-------|-----|
| WP1 | Core Infrastructure | Frontend Lead | 3.5 | M1 | M2 |
| WP2 | Student Module | Senior UI Dev | 4.5 | M2 | M4 |
| WP3 | Professor Module | Frontend Lead | 4.5 | M3 | M5 |
| WP4 | Calendar & Events | UI Developer | 3.5 | M4 | M6 |
| WP5 | Payment Integration | Integration Dev | 3.5 | M5 | M7 |
| WP6 | Real-Time Features | Integration Dev | 3.0 | M6 | M8 |
| WP7 | Performance & Polish | Senior UI Dev | 4.5 | M8 | M10 |
| WP8 | Testing & Quality | QA Engineer | 4.0 | M9 | M11 |
| WP9 | Deployment & Monitoring | DevOps | 4.0 | M11 | M12 |
| **Total** | | | **35.0** | | |

---

### 4.2 Coordination and Task Schedule

#### Gantt Chart

```
Month:       1    2    3    4    5    6    7    8    9   10   11   12
            |----|----|----|----|----|----|----|----|----|----|----|----|
WP1 Core    [========]
WP2 Student      [==============]
WP3 Professor         [==============]
WP4 Calendar               [==============]
WP5 Payment                     [==============]
WP6 Real-Time                        [==============]
WP7 Performance                                   [==============]
WP8 Testing                                            [==============]
WP9 Deployment                                                   [========]

Milestones:
    M1 ▼ (M2)  - Authentication & ACL Complete
    M2 ▼ (M4)  - Student Module Complete
    M3 ▼ (M5)  - Professor Module Complete
    M4 ▼ (M7)  - Payment System Live
    M5 ▼ (M8)  - Real-Time Features Complete
    M6 ▼ (M10) - Performance Optimized
    M7 ▼ (M12) - Production Launch
```

#### Milestone Definitions

| Milestone | Month | Criteria | Deliverables |
|-----------|-------|----------|--------------|
| M1 | 2 | Users can login, ACL enforced | Auth flow, protected routes |
| M2 | 4 | Students can use all features | Dashboard, lessons, quizzes |
| M3 | 5 | Professors can manage content | CRUD operations, student management |
| M4 | 7 | Payments functional | Subscriptions, manual payments |
| M5 | 8 | Real-time notifications | WebSocket, notification UI |
| M6 | 10 | Performance targets met | < 3s load, mobile responsive |
| M7 | 12 | Production deployment | CI/CD, monitoring, docs |

#### Sprint Structure

- **Sprint Duration:** 2 weeks
- **Total Sprints:** 24
- **Ceremonies:**
  - Sprint Planning: Day 1
  - Daily Standups: 15 min
  - Sprint Review: Last day
  - Retrospective: Last day

### 4.3 Available Research Infrastructure

#### Development Environment

| Resource | Specification |
|----------|--------------|
| Operating System | macOS Darwin 25.2.0 |
| Runtime | Node.js 18+ LTS |
| Package Manager | npm / yarn |
| Version Control | Git 2.x |
| IDE | VS Code with extensions |

#### Production Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Hosting | Cloud Provider (AWS/GCP) | Application hosting |
| CDN | CloudFront/Cloud CDN | Static asset delivery |
| Identity | Keycloak | Authentication server |
| Monitoring | Elastic APM | Performance monitoring |
| Cache | Redis | Session management |
| DNS | Route53/Cloud DNS | Domain management |

#### Development Tools and Libraries

**From `package.json`:**

| Category | Libraries |
|----------|-----------|
| **Framework** | Next.js 13.3.2, React 18.2.0 |
| **Language** | TypeScript 5.8.3 |
| **UI Library** | @mui/material 5.14.13, @emotion/react 11.11.1 |
| **State** | @reduxjs/toolkit 1.9.5, redux-persist 6.0.0 |
| **Forms** | react-hook-form 7.43.9, yup 1.1.1 |
| **HTTP** | axios 1.4.0 |
| **Auth** | @casl/ability 6.5.0, @casl/react 3.1.0 |
| **Real-Time** | @stomp/stompjs 7.0.0, sockjs-client 1.6.1 |
| **Charts** | recharts 2.5.0, apexcharts 3.28.5, chart.js 4.2.1 |
| **Calendar** | @fullcalendar/react 6.1.6 |
| **PDF** | react-pdf 7.7.1 |
| **i18n** | i18next 23.3.0, react-i18next 13.0.2 |
| **Date** | date-fns 2.30.0, react-datepicker 4.11.0 |
| **Monitoring** | @elastic/apm-rum 5.17.0 |

### 4.4 Manpower Allocation

#### Person-Month Distribution by Role and Work Package

| Role | WP1 | WP2 | WP3 | WP4 | WP5 | WP6 | WP7 | WP8 | WP9 | **Total** |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----------|
| Frontend Lead | 1.5 | 1.0 | 1.5 | 0.5 | 0.5 | 0.5 | 1.0 | 0.5 | 1.0 | **8.0** |
| Senior UI Dev | 0.5 | 2.0 | 1.5 | 1.0 | 0.5 | 0.5 | 2.0 | 0.5 | 0.5 | **9.0** |
| UI Developer 1 | 0.5 | 1.0 | 1.0 | 1.5 | 0.5 | 0.5 | 1.0 | 0.5 | 0.5 | **7.0** |
| UI Developer 2 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | 0.5 | **4.5** |
| Integration Dev | 0.5 | 0.0 | 0.0 | 0.0 | 1.5 | 1.5 | 0.0 | 0.5 | 0.5 | **4.5** |
| QA Engineer | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.5 | 0.5 | **2.0** |
| DevOps | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.5 | **0.5** |
| **Total** | **3.5** | **4.5** | **4.5** | **3.5** | **3.5** | **3.5** | **4.5** | **4.0** | **4.0** | **35.5** |

#### Monthly Team Allocation

| Month | Active WPs | Team Members | Total PM |
|-------|------------|--------------|----------|
| M1 | WP1 | 4 | 2.0 |
| M2 | WP1, WP2 | 5 | 3.5 |
| M3 | WP2, WP3 | 5 | 4.0 |
| M4 | WP2, WP3, WP4 | 5 | 4.5 |
| M5 | WP3, WP4, WP5 | 5 | 4.0 |
| M6 | WP4, WP5, WP6 | 4 | 3.5 |
| M7 | WP5, WP6 | 3 | 2.5 |
| M8 | WP6, WP7 | 4 | 3.0 |
| M9 | WP7, WP8 | 4 | 3.0 |
| M10 | WP7, WP8 | 4 | 3.0 |
| M11 | WP8, WP9 | 4 | 2.5 |
| M12 | WP9 | 3 | 2.0 |

### 4.5 Project Budget and Partners Share

#### Budget Breakdown

| Category | Allocation (%) | Description |
|----------|---------------|-------------|
| Personnel | 70% | Salaries for 35 person-months |
| Infrastructure | 15% | Cloud hosting, services, APIs |
| Tools & Licenses | 5% | Design tools, testing services |
| Training | 5% | Team upskilling, certifications |
| Contingency | 5% | Risk buffer |
| **Total** | **100%** | |

#### Infrastructure Costs (Monthly Estimate)

| Service | Estimated Cost | Notes |
|---------|----------------|-------|
| Cloud Hosting | 200 EUR | App servers, databases |
| Keycloak | 100 EUR | Authentication server |
| CDN | 50 EUR | Static asset delivery |
| Monitoring (APM) | 100 EUR | Elastic APM |
| Domain & SSL | 20 EUR | DNS, certificates |
| **Monthly Total** | **470 EUR** | |
| **Annual Total** | **5,640 EUR** | |

#### Risk Analysis and Contingency

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Contingency |
|---------|-----------------|-------------|--------|---------------------|-------------|
| R1 | API breaking changes from backend | Medium | High | API versioning, contract testing | 2 weeks buffer |
| R2 | Keycloak upgrade compatibility | Low | Medium | Version locking, staging tests | 1 week buffer |
| R3 | Stripe API deprecation | Low | High | Abstract payment layer | 1 week buffer |
| R4 | WebSocket connectivity issues | Medium | Medium | Fallback to polling | Built-in fallback |
| R5 | Performance degradation | Medium | Medium | APM monitoring, load testing | Optimization sprint |
| R6 | Browser compatibility | Low | Low | Polyfills, cross-browser testing | Testing included |

---

## 5. References

### Technical Documentation

1. **Next.js Documentation**
   https://nextjs.org/docs
   Framework reference for routing, SSR, and API routes

2. **React Documentation**
   https://react.dev
   Core React concepts and hooks

3. **Material-UI (MUI) Documentation**
   https://mui.com
   Component library reference

4. **Redux Toolkit Documentation**
   https://redux-toolkit.js.org
   State management patterns

5. **CASL Authorization Library**
   https://casl.js.org
   Role-based access control implementation

6. **Keycloak Documentation**
   https://www.keycloak.org/docs
   Authentication and authorization server

7. **Stripe Documentation**
   https://stripe.com/docs
   Payment integration reference

8. **OpenAPI Generator**
   https://openapi-generator.tech
   API client generation

9. **STOMP Protocol**
   https://stomp.github.io
   WebSocket messaging protocol

10. **Elastic APM RUM**
    https://www.elastic.co/guide/en/apm/agent/rum-js
    Frontend performance monitoring

### Project-Specific Files

| Purpose | File Path |
|---------|-----------|
| ACL Configuration | `src/configs/acl.js` |
| Authentication Context | `src/context/AuthContext.js` |
| Application Bootstrap | `src/pages/_app.js` |
| Navigation Configuration | `src/navigation/vertical/index.js` |
| User Redux Store | `src/store/apps/user/index.js` |
| API Specification | `src/apiSpec.js` |
| WebSocket Service | `src/@core/axios/WebSocketService.js` |
| Payment Service | `src/services/payment-service.ts` |
| Generated API Clients | `src/generated/` |
| Axios Configuration | `src/@core/axios/axiosEmentor.js` |
| Theme Configuration | `src/configs/themeConfig.js` |

---

**Document prepared by:** E-Mentor Development Team
**Last updated:** January 2026
**Version:** 1.0
