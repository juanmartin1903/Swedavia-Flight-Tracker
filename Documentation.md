
---

# 📄 **PROJECT DOCUMENTATION — Swedavia Flight Tracker (Reverse Engineering Project)**  
**Author:** Juan Martin, Johannes Noyan, Ali Cay  
**Course:** APL Project 2026  
**Language:** English  

---

# 🟦 **Phase 1 — Research Phase (Pre‑study)**

## **Project Purpose**
The goal of this assignment was to reverse‑engineer a fully working application originally created inside Google AI Studio. The exported version of the project did not function correctly, so the task was to analyze the working AI Studio version, identify missing components, and rebuild the backend and logic until the application behaved exactly the same.

The application is a **flight tracking dashboard** that displays live flight data from Swedavia’s public API.

---

## **Information Gathering**
During the research phase, I collected information from several sources:

- Google AI Studio documentation  
- Swedavia FlightInfo API v2 documentation  
- Tutorials on Express, Vite, React 19, and TailwindCSS  
- GitHub repositories with similar architectures  
- Network logs from the working AI Studio version  
- Practical testing to understand missing backend logic  

---

## **Tools and Technologies**
- **React 19** – frontend  
- **Express.js** – backend  
- **Vite** – dev server and bundler  
- **TailwindCSS** – styling  
- **Node.js** – runtime  
- **Google AI Studio** – original generator  
- **Cloud Run** – deployment  
- **Loopia** – DNS hosting  
- **GitHub** – version control  

---

## **Planning**
1. Run the exported project locally  
2. Compare it with the working AI Studio version  
3. Identify missing backend endpoints  
4. Rebuild backend through reverse engineering  
5. Add mock data to restore UI functionality  
6. Integrate the real Swedavia API  
7. Deploy to Cloud Run  
8. Connect a custom domain from Loopia  

---

## **Problems & Solutions (Research Phase)**

| Problem | Solution |
|--------|----------|
| Missing backend logic | Reverse‑engineered endpoints manually |
| Hard to understand API structure | Inspected JSON responses from Cloud Run |
| Missing API keys | Created `.env.local` and added required keys |
| Exported project incomplete | Compared with working AI Studio version |

---

# 🟦 **Phase 2 — Implementation Phase**

## **How the Work Started**
The exported project did not run correctly. The UI loaded, but no data appeared, and several errors occurred. I began by running the app locally and inspecting console and network logs.

---

## **Project Structure and First Steps**
- Added missing Tailwind configuration  
- Fixed Vite + Express integration  
- Replaced the default `npm run dev` with a custom Express dev server  
- Created mock data to restore UI functionality  
- Implemented missing API endpoints  
- Connected the real Swedavia API  

---

## **Development Steps**
1. Fix UI rendering (Tailwind + Vite)  
2. Restore backend functionality  
3. Add `/api/flights`, `/api/destinations`, `/api/health`  
4. Add mock data for testing  
5. Implement Swedavia proxy logic  
6. Test all endpoints  
7. Deploy to Cloud Run  
8. Configure Loopia DNS  

---

## **Problems & Solutions (Implementation Phase)**

| Problem | Solution |
|--------|----------|
| “Unexpected token <” (HTML instead of JSON) | Backend missing → rebuilt Express server |
| Vite dev server conflicting with Express | Replaced dev script with `tsx server.ts` |
| Missing API keys | Added `.env.local` with `GEMINI_API_KEY` and `SWEDAVIA_API_KEY` |
| Ports already in use | Killed zombie Node processes |
| App worked in AI Studio but not locally | Reverse‑engineered backend behavior |

---

# 🟦 **Phase 3 — Finalization & Improvements**

## **Finishing the Project**
- Backend and frontend now behave exactly like the AI Studio version  
- API calls work with real Swedavia data  
- UI fully functional with live flights and destinations  
- Deployment successful on Cloud Run  
- Custom domain connected via Loopia  

---

## **Testing**
- Tested all API endpoints manually  
- Verified UI behavior with mock and real data  
- Tested deployment environment  
- Verified DNS propagation and HTTPS  

---

## **Improvements Made**
- Added fallback mock data when API key is missing  
- Improved error handling  
- Cleaned up project structure  
- Optimized server for production  

---

# 🟦 **Phase 4 — Problems & Solutions (Summary)**

### **Problem 1 — Exported project missing backend**
**Solution:** Rebuilt backend manually using reverse engineering.

### **Problem 2 — API keys missing**
**Solution:** Created `.env.local` and added required keys.

### **Problem 3 — UI completely blank**
**Solution:** Added Tailwind config and imported CSS correctly.

### **Problem 4 — Ports blocked**
**Solution:** Killed processes using `kill -9 PID`.

### **Problem 5 — Deployment issues**
**Solution:** Deployed via Cloud Run and configured Loopia DNS.

---

# 🟦 **GitHub Repository**
The full source code of the project is available here:

https://github.com/juanmartin1903/Swedavia-Flight-Tracker

This repository contains:

- The full React + Express project  
- The rebuilt backend  
- The mock data  
- The deployment configuration  
- Documentation and code comments  

---

# 🟦 **Original Google AI Studio Prompt**

This is the exact prompt used to generate the initial version of the application inside Google AI Studio. It served as the foundation for the reverse‑engineering process.

```
To: Project Stakeholders, Engineering Lead, and Operations Team From: Senior
Systems Analyst / Technical Documentation Specialist Date: October 26, 2023
Subject: Project Documentation: Swedavia Flight Tracker (v1.0)

1. Executive Summary

Project Purpose The Swedavia Flight Tracker is a high-performance command-line
interface (CLI) tool designed to provide real-time visibility into the aviation
ecosystem across Sweden’s 10 major airports (including Arlanda, Landvetter, and
Bromma). By bridging the gap between complex aviation data streams and end-user
accessibility, the tool empowers operators and analysts to monitor flight
statuses, verify network health, and perform rapid destination audits.

Business Value In an industry where data latency can impact operational
decision-making, the Swedavia Flight Tracker offers two primary advantages:

1.  Operational Awareness: Real-time integration with the Swedavia FlightInfo
    API v2 ensures stakeholders have immediate access to the most accurate
    flight schedules and statuses.
2.  Cost and Time Efficiency: Through a sophisticated local data-handling
    strategy, the system provides instant destination analytics without the
    overhead of external API calls, ensuring high availability even during
    network instability or API downtime.

Key Outcomes The application delivers a streamlined interface that handles
complex OData queries, monitors API service availability, and provides a
localized "efficiency layer" for geographical data aggregation. It is a robust,
scalable solution for flight data management.

2. Technical Architecture & Design

System Architecture Overview The application follows a modular, decoupled
architecture built on Python. It adheres to the Separation of Concerns (SoC)
principle, ensuring that the user interface, business logic, and data retrieval
layers operate independently.

Component Breakdown

  - airport.py (Orchestration & Interface): Acts as the system’s entry point and
    Controller. It manages the CLI loop, captures user input, and handles the
    presentation layer. It interfaces directly with the Swedavia REST API.
  - destinationer.py (Logic & Analytics Layer): A specialized module dedicated
    to processing geographical and destination-based data. By isolating this
    logic, the system maintains a clean codebase where complex calculations are
    separated from the primary CLI flow.

Data Strategy & Integration The system utilizes a Hybrid Data Model:

1.  External Layer: Swedavia FlightInfo API v2 (RESTful). Used for volatile data
    (live flight times, gate assignments).
2.  Internal Efficiency Layer: city_country.json. A local, pre-processed dataset
    containing static mapping of cities and countries.
      - Design Rationale: To minimize latency and API consumption costs, the
        "Destination Overview" feature queries this local JSON. This ensures
        that country-level aggregation remains lightning-fast and functional
        offline.

Flow Control & Error Handling

  - API Interaction: Uses synchronous HTTP requests with status code validation.
  - OData Implementation: The system allows for dynamic query string
    construction, enabling users to inject arbitrary OData filters directly into
    the API request pipeline.
  - Health Checks: A dedicated routine verifies the connectivity and response
    headers of the Swedavia endpoint before mission-critical data operations are
    performed.

3. Detailed Functional Requirements

The following table outlines the core features and the technical requirements
necessary for their execution.

| Feature ID | Feature Name                      | Technical Requirements                                                                                                                                                     |
| :--------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-01**  | **Interactive CLI Menu**          | System must implement a loop-based menu with 6 distinct input options. Must include input validation to prevent crash on non-integer entries.                              |
| **FR-02**  | **Real-time API Integration**     | Must establish a secure connection to Swedavia FlightInfo API v2 using API Keys. Must parse JSON responses into human-readable CLI tables.                                 |
| **FR-03**  | **Advanced OData Querying**       | System must support arbitrary OData string injection (e.g., `$filter`, `$top`) to allow for server-side data filtering based on specific flight criteria.                  |
| **FR-04**  | **API Health Check**              | Must implement a diagnostic routine that pings the Swedavia endpoint and returns HTTP status codes (e.g., 200 OK) to confirm service availability.                         |
| **FR-05**  | **Offline Destination Analytics** | Using `destinationer.py`, the system must aggregate unique cities and countries from `city_country.json`. This feature **must not** trigger an external API call.          |
| **FR-06**  | **Local Data Integrity**          | The system must verify the existence and schema of `city_country.json` upon startup. If the file is missing, the system must provide a graceful fallback or error message. |
| **FR-07**  | **Network Latency Mitigation**    | API calls must include a timeout threshold (e.g., 10 seconds) to prevent the CLI from hanging during intermittent connectivity issues.                                     |
| **FR-08**  | **Multi-Airport Support**         | The interface must allow the user to toggle context between all 10 Swedavia airports (ARN, GOT, BMA, etc.) via IATA code selection.                                        |

Approval & Documentation Standards This document serves as the technical
baseline for Swedavia Flight Tracker v1.0. Future iterations involving GUI
implementation or database migrations will be appended as amendments to
Section 2.

```

---

# 🟦 **Conclusion**

This project resulted in a fully functional flight‑tracking application that mirrors the behavior of the original AI Studio version. Through reverse engineering, I learned:

- How AI Studio structures its projects  
- How to rebuild missing backend logic  
- How to debug complex React/Express environments  
- How to deploy applications using Cloud Run  
- How to connect a custom domain via Loopia  

The project strengthened my skills in problem‑solving, API integration, debugging, and modern web development.

---
