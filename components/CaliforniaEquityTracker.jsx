"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

const BILLS_DATA = [
  {
    id: "AB-49", number: "AB 49", chamber: "Assembly",
    title: "Safe Haven Schools Act",
    author: "Al Muratsuchi", authorParty: "D", authorDistrict: "AD-66", authorRegion: "South Bay / Torrance",
    summary: "Keeps ICE out of California public schools. Schools must now require a judicial warrant before allowing immigration agents into non-public areas, and must notify families if enforcement shows up.",
    topics: ["Education (K-12)", "Immigration"],
    status: "Signed into Law",
    dateIntroduced: "2025-01-06", lastAction: "2025-09-20", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "The bill targets immigration status, not any specific racial group. Immigration enforcement on school campuses creates fear across all immigrant communities including Black, Latino/a/e, Asian, and MENA families. Flagged as working-class relevant because immigration enforcement targets families in low-wage labor sectors.",
    race: ["Immigrants"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB49",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-01-06", detail: "Read first time, referred to Committee" },
      { step: 2, label: "Committee", date: "2025-03-19", detail: "Assembly Education Committee" },
      { step: 3, label: "Fiscal", date: "2025-04-28", detail: "Assembly Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-05-22", detail: "Assembly Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-06-25", detail: "Senate Education Committee" },
      { step: 6, label: "Floor (2nd)", date: "2025-08-28", detail: "Senate Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-12", detail: "Enrolled and sent to Governor" },
      { step: 8, label: "Signed", date: "2025-09-20", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-48", number: "SB 48", chamber: "Senate",
    title: "Educational Equity: Discrimination Prevention Coordinators",
    author: "Lena Gonzalez", authorParty: "D", authorDistrict: "SD-33", authorRegion: "Long Beach / SE LA",
    summary: "Creates four new state-level coordinators to prevent discrimination in schools, one each for Religious, Race/Ethnicity, Gender, and LGBTQ bias, housed in a new Office of Civil Rights.",
    topics: ["Education (K-12)", "Civil Rights & Voting"],
    status: "Signed into Law",
    dateIntroduced: "2025-01-06", lastAction: "2025-10-07", lastActionText: "Signed by Governor Newsom",
    equityProximity: "explicit", equityDirection: "advances",
    equityRationale: "Explicitly creates Race and Ethnicity, Gender, and LGBTQ Discrimination Prevention Coordinator positions in schools. Addresses intersecting forms of discrimination for students of color who are also LGBTQ+ or gender-nonconforming.",
    race: ["Black", "Latino/a/e", "Asian", "Indigenous", "MENA"],
    gender: true, lgbtq: true, disability: false, workingClass: false,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB48",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-01-06", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-26", detail: "Senate Education Committee" },
      { step: 3, label: "Fiscal", date: "2025-05-12", detail: "Senate Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-05-29", detail: "Senate Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-07-09", detail: "Assembly Education Committee" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-10", detail: "Assembly Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-15", detail: "Enrolled and sent to Governor" },
      { step: 8, label: "Signed", date: "2025-10-07", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-642", number: "SB 642", chamber: "Senate",
    title: "Pay Equity Enforcement Act",
    author: "Monique Lim\u00f3n", authorParty: "D", authorDistrict: "SD-21", authorRegion: "Santa Barbara / Ventura",
    summary: "Strengthens California's equal pay law: broadens what counts as wages (now includes stock, bonuses, benefits), gives workers 3 years instead of 2 to file claims, and tightens pay scale disclosure.",
    topics: ["Labor & Workers' Rights", "Civil Rights & Voting"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-20", lastAction: "2025-10-08", lastActionText: "Signed by Governor Newsom",
    equityProximity: "explicit", equityDirection: "advances",
    equityRationale: "Directly prohibits pay discrimination based on race and ethnicity. The racial pay gap disproportionately harms Black and Latina women workers. Expanded definition of 'wages' captures forms of compensation (stock, bonuses) where disparities are widest.",
    race: ["Black", "Latino/a/e"],
    gender: true, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB642",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-20", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-09", detail: "Senate Labor Committee" },
      { step: 3, label: "Fiscal", date: "2025-05-19", detail: "Senate Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-05-30", detail: "Senate Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-07-02", detail: "Assembly Labor & Employment" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-08", detail: "Assembly Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-18", detail: "Enrolled and sent to Governor" },
      { step: 8, label: "Signed", date: "2025-10-08", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "AB-288", number: "AB 288", chamber: "Assembly",
    title: "Worker Organizing Rights (PERB Expansion)",
    author: "Ash Kalra", authorParty: "D", authorDistrict: "AD-25", authorRegion: "San Jose",
    summary: "Creates a California backstop for worker organizing. When the federal labor board fails to act within 6 months, California's PERB steps in. This matters now because the federal NLRB has been gutted.",
    topics: ["Labor & Workers' Rights"],
    status: "Signed into Law",
    dateIntroduced: "2025-01-16", lastAction: "2025-10-10", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Strengthens labor organizing protections broadly, with structural impact on Black, Latino/a/e, and immigrant workers concentrated in sectors with weak federal labor enforcement. Working-class communities of color stand to gain most from state-level organizing rights when federal agencies are defunded or inactive.",
    race: ["Black", "Latino/a/e", "Immigrants"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB288",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-01-16", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-26", detail: "Assembly Labor & Employment" },
      { step: 3, label: "Fiscal", date: "2025-05-14", detail: "Assembly Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-05-29", detail: "Assembly Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-07-09", detail: "Senate Labor Committee" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-10", detail: "Senate Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-20", detail: "Enrolled and sent to Governor" },
      { step: 8, label: "Signed", date: "2025-10-10", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "AB-1340", number: "AB 1340", chamber: "Assembly",
    title: "TNC Drivers Labor Relations Act",
    author: "Buffy Wicks", authorParty: "D", authorDistrict: "AD-14", authorRegion: "Oakland / East Bay",
    summary: "Gives Uber and Lyft drivers the right to form unions and bargain collectively for the first time in California. Part of a deal between labor and industry.",
    topics: ["Labor & Workers' Rights", "Transportation"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-21", lastAction: "2025-10-03", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Rideshare drivers are disproportionately Black, Latino/a/e, and immigrant workers. Collective bargaining rights directly address exploitation in gig work that tracks racial and class lines.",
    race: ["Black", "Latino/a/e", "Immigrants"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB1340",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-21", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-16", detail: "Assembly Labor & Employment" },
      { step: 3, label: "Fiscal", date: "2025-05-21", detail: "Assembly Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-06-04", detail: "Assembly Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-08-20", detail: "Senate Labor Committee" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-11", detail: "Senate Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-22", detail: "Enrolled and sent to Governor" },
      { step: 8, label: "Signed", date: "2025-10-03", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-464", number: "SB 464", chamber: "Senate",
    title: "Employer Pay Data Reporting Expansion",
    author: "Lola Smallwood-Cuevas", authorParty: "D", authorDistrict: "SD-28", authorRegion: "South LA / Baldwin Hills",
    summary: "Forces employers to report more detailed pay data by race and gender. Gives the Civil Rights Department sharper tools to spot the largest pay gaps. Signed October 13, 2025.",
    topics: ["Labor & Workers' Rights", "Civil Rights & Voting"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-18", lastAction: "2025-10-13", lastActionText: "Signed by Governor Newsom",
    equityProximity: "explicit", equityDirection: "advances",
    equityRationale: "Directly addresses racial and gender pay disparities through expanded demographic data collection. Gender is central: the bill captures intersectional pay gaps where women of color earn least. MENA workers benefit from expanded demographic categories that make their experiences visible in data for the first time.",
    race: ["Black", "Latino/a/e", "Asian", "MENA"],
    gender: true, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB464",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-18", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-02", detail: "Senate Labor Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-05-28", detail: "Senate Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-07-09", detail: "Assembly Labor & Employment" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-08", detail: "Assembly Floor" },
      { step: 8, label: "Signed", date: "2025-10-13", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "AB-692", number: "AB 692", chamber: "Assembly",
    title: "Ban on Employer Debt Repayment (TRAPs)",
    author: "Ash Kalra", authorParty: "D", authorDistrict: "AD-25", authorRegion: "San Jose",
    summary: "Bans employers from making workers repay training costs when they leave a job. These TRAPs were trapping workers in nursing, trucking, and tech bootcamps in jobs they could not afford to quit.",
    topics: ["Labor & Workers' Rights"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-14", lastAction: "2025-10-13", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Training repayment agreements (TRAPs) disproportionately trap low-wage workers, overwhelmingly Black and Latino/a/e, in exploitative employment. Workers in nursing, trucking, and tech bootcamps are most affected.",
    race: ["Black", "Latino/a/e", "Immigrants"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB692",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-14", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-26", detail: "Assembly Labor & Employment" },
      { step: 4, label: "Floor (1st)", date: "2025-05-29", detail: "Assembly Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-07-02", detail: "Senate Labor Committee" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-08", detail: "Senate Floor" },
      { step: 8, label: "Signed", date: "2025-10-13", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-42", number: "SB 42", chamber: "Senate",
    title: "Repeal Ban on Public Financing of Elections",
    author: "Tom Umberg", authorParty: "D", authorDistrict: "SD-34", authorRegion: "Santa Ana / Orange County",
    summary: "Lifts California's ban on publicly financed elections, letting any city or county create programs where candidates receive public funds instead of relying on private donors. Goes to the Nov 2026 ballot.",
    topics: ["Civil Rights & Voting", "Government & Elections"],
    status: "Referred to Ballot",
    dateIntroduced: "2025-01-06", lastAction: "2025-10-02", lastActionText: "Signed by Governor, sent to November 2026 statewide ballot",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Wealth concentration in whiter and older communities creates barriers for candidates from communities of color. Public financing levels the playing field for Black and Latino/a/e candidates, and for women candidates who face steeper fundraising barriers.",
    race: ["Black", "Latino/a/e"],
    gender: true, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB42",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-01-06", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-19", detail: "Senate Elections Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-05-22", detail: "Senate Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-07-02", detail: "Assembly Elections Committee" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-12", detail: "Assembly Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-13", detail: "Referred to November 2026 statewide ballot" },
    ],
  },
  {
    id: "SB-7", number: "SB 7", chamber: "Senate",
    title: "No Robo Bosses Act",
    author: "Aisha Wahab", authorParty: "D", authorDistrict: "SD-10", authorRegion: "Fremont / Hayward",
    summary: "Would have required employers to disclose when they use AI for hiring, scheduling, and surveillance, and let workers challenge automated decisions. Governor vetoed it citing innovation concerns.",
    topics: ["Labor & Workers' Rights", "Technology & AI"],
    status: "Vetoed",
    dateIntroduced: "2025-01-06", lastAction: "2025-10-12", lastActionText: "Vetoed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Automated hiring systems encode racial bias, disproportionately screening out Black and Latino/a/e applicants. AI surveillance concentrates in lower-wage sectors. The disability dimension is critical: algorithmic hiring often penalizes non-standard speech patterns, gaps in employment history, and non-traditional credentials.",
    race: ["Black", "Latino/a/e"],
    gender: true, lgbtq: false, disability: true, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB7",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-01-06", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-02", detail: "Senate Labor Committee" },
      { step: 3, label: "Fiscal", date: "2025-05-19", detail: "Senate Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-05-29", detail: "Senate Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-07-09", detail: "Assembly Labor & Employment" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-10", detail: "Assembly Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-18", detail: "Enrolled and sent to Governor" },
      { step: 8, label: "Vetoed", date: "2025-10-12", detail: "Vetoed by Governor" },
    ],
  },
  {
    id: "AB-865", number: "AB 865", chamber: "Assembly",
    title: "Dual Language Immersion Education Materials",
    author: "Sabrina Cervantes", authorParty: "D", authorDistrict: "SD-31", authorRegion: "Riverside / Corona",
    summary: "Would have created a $5M grant program to help schools buy instructional materials in languages other than English. Died in Appropriations during the budget deficit.",
    topics: ["Education (K-12)"],
    status: "Failed in Committee",
    dateIntroduced: "2025-02-20", lastAction: "2025-05-23", lastActionText: "Failed to pass deadline in Assembly Appropriations",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Dual language programs affirm home languages and cultures of Latino/a/e, Asian, and immigrant students while improving academic outcomes across linguistic communities. Language is a core axis of racialization.",
    race: ["Latino/a/e", "Asian", "Immigrants"],
    gender: false, lgbtq: false, disability: false, workingClass: false,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB865",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-20", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-09", detail: "Assembly Education Committee" },
      { step: 3, label: "Failed", date: "2025-05-23", detail: "Held in Assembly Appropriations" },
    ],
  },
  {
    id: "AB-1454", number: "AB 1454", chamber: "Assembly",
    title: "Science of Reading / Literacy Instruction",
    author: "Robert Rivas / Blanca Rubio / Al Muratsuchi", authorParty: "D", authorDistrict: "AD-29 / AD-48 / AD-66", authorRegion: "Salinas / Baldwin Park / Torrance",
    summary: "Requires all CA public schools to teach reading using evidence-based methods instead of discredited approaches. Comes with $200M for teacher retraining. Passed unanimously in the Senate.",
    topics: ["Education (K-12)"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-20", lastAction: "2025-10-09", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Literacy gaps disproportionately affect Black and Latino/a/e students. Disability relevance is direct: dyslexia and reading disabilities are underdiagnosed in students of color, and science of reading approaches improve identification and support for learning differences.",
    race: ["Black", "Latino/a/e"],
    gender: false, lgbtq: false, disability: true, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB1454",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-20", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-30", detail: "Assembly Education Committee" },
      { step: 3, label: "Fiscal", date: "2025-05-21", detail: "Assembly Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-06-04", detail: "Assembly Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-08-20", detail: "Senate Education Committee" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-08", detail: "Senate Floor" },
      { step: 8, label: "Signed", date: "2025-10-09", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-261", number: "SB 261", chamber: "Senate",
    title: "Wage Judgment Enforcement Penalties",
    author: "Aisha Wahab", authorParty: "D", authorDistrict: "SD-10", authorRegion: "Fremont / Hayward",
    summary: "Punishes employers who refuse to pay workers even after a court orders them to. Within 60 days of a final judgment, employers must prove they paid or face escalating penalties.",
    topics: ["Labor & Workers' Rights"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-04", lastAction: "2025-10-08", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Wage theft disproportionately affects low-wage Black, Latino/a/e, and immigrant workers, an estimated $2B+ annually in CA. Stronger enforcement targets industries most likely to exploit vulnerable workers: garment, food processing, construction, domestic work.",
    race: ["Black", "Latino/a/e", "Immigrants"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB261",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-04", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-26", detail: "Senate Labor Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-05-22", detail: "Senate Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-10", detail: "Assembly Floor" },
      { step: 8, label: "Signed", date: "2025-10-08", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-303", number: "SB 303", chamber: "Senate",
    title: "Bias Mitigation Training Protections",
    author: "Lola Smallwood-Cuevas", authorParty: "D", authorDistrict: "SD-28", authorRegion: "South LA / Baldwin Hills",
    summary: "Protects workplace diversity trainings by ensuring employees who honestly acknowledge biases during anti-bias programs cannot be sued for it. Removes the chilling effect that was killing DEI programs.",
    topics: ["Labor & Workers' Rights", "Civil Rights & Voting"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-10", lastAction: "2025-10-01", lastActionText: "Signed by Governor Newsom",
    equityProximity: "explicit", equityDirection: "advances",
    equityRationale: "Directly protects anti-discrimination and anti-bias training programs addressing race, gender, LGBTQ+, and disability bias. Without these protections, employers were canceling DEI programs out of litigation fear, disproportionately harming workers of color.",
    race: ["Black", "Latino/a/e", "Asian", "MENA"],
    gender: true, lgbtq: true, disability: true, workingClass: false,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB303",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-10", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-26", detail: "Senate Judiciary Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-05-22", detail: "Senate Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-08", detail: "Assembly Floor" },
      { step: 8, label: "Signed", date: "2025-10-01", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-617", number: "SB 617", chamber: "Senate",
    title: "WARN Act: Workforce Development Coordination",
    author: "Dave Cortese", authorParty: "D", authorDistrict: "SD-15", authorRegion: "San Jose / Santa Clara",
    summary: "When companies do mass layoffs, they now must tell workers about workforce development board coordination and provide food assistance info. Before this, WARN notices were bare-bones.",
    topics: ["Labor & Workers' Rights"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-19", lastAction: "2025-10-08", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Mass layoffs disproportionately impact Black and Latino/a/e workers in manufacturing and service sectors. Connecting laid-off workers to workforce development boards can improve outcomes but also requires accountability for what those boards actually deliver.",
    race: ["Black", "Latino/a/e"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB617",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-19", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-02", detail: "Senate Labor Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-05-28", detail: "Senate Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-08", detail: "Assembly Floor" },
      { step: 8, label: "Signed", date: "2025-10-08", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-761", number: "SB 761", chamber: "Senate",
    title: "CalFresh for College Students",
    author: "Josh Newman", authorParty: "D", authorDistrict: "SD-29", authorRegion: "Fullerton / North OC",
    summary: "Makes it easier for college students to get CalFresh by streamlining eligibility and letting students opt in through their financial aid portal. Nearly half of CA community college students report food insecurity.",
    topics: ["Higher Education", "Food & Agriculture", "Children & Families"],
    status: "Passed Legislature",
    dateIntroduced: "2025-02-20", lastAction: "2025-09-12", lastActionText: "Sent to Governor",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Food insecurity among college students disproportionately affects Black, Latino/a/e, and first-generation students. At CA community colleges, nearly 50% of students report food insecurity. Streamlined CalFresh addresses a key barrier to degree completion for working-class students of color.",
    race: ["Black", "Latino/a/e", "Immigrants"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB761",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-20", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-09", detail: "Senate Education Committee" },
      { step: 3, label: "Fiscal", date: "2025-05-19", detail: "Senate Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-05-30", detail: "Senate Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-08-20", detail: "Assembly Higher Education" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-10", detail: "Assembly Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-12", detail: "Enrolled and sent to Governor" },
    ],
  },
  {
    id: "AB-858", number: "AB 858", chamber: "Assembly",
    title: "Hospitality Worker Reinstatement Extension",
    author: "Alex Lee", authorParty: "D", authorDistrict: "AD-24", authorRegion: "Milpitas / South Bay",
    summary: "Extends COVID-era right-of-return protections for hospitality workers through 2027. When positions reopen, employers must offer them to previously laid-off workers first, by seniority.",
    topics: ["Labor & Workers' Rights"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-20", lastAction: "2025-10-03", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Hospitality has a majority Black, Latino/a/e, and immigrant workforce. COVID layoffs devastated these communities. Women of color in housekeeping, food service, and front desk roles were displaced at higher rates and face steeper barriers to reemployment.",
    race: ["Black", "Latino/a/e", "Immigrants"],
    gender: true, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB858",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-20", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-02", detail: "Assembly Labor & Employment" },
      { step: 4, label: "Floor (1st)", date: "2025-05-29", detail: "Assembly Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-08", detail: "Senate Floor" },
      { step: 8, label: "Signed", date: "2025-10-03", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-627", number: "SB 627", chamber: "Senate",
    title: "No Secret Police Act",
    author: "Scott Wiener", authorParty: "D", authorDistrict: "SD-11", authorRegion: "San Francisco",
    summary: "Bans law enforcement from wearing masks during most operations. Direct response to masked federal agents conducting immigration raids where officers could not be identified.",
    topics: ["Criminal Justice", "Civil Rights & Voting"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-19", lastAction: "2025-09-20", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Masked law enforcement disproportionately targets communities of color and immigrant neighborhoods. LGBTQ+ relevance: anonymous policing has historically been used to intimidate LGBTQ+ communities, particularly trans people of color during protests.",
    race: ["Black", "Latino/a/e", "Immigrants"],
    gender: false, lgbtq: true, disability: false, workingClass: false,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB627",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-19", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-08", detail: "Senate Public Safety Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-05-29", detail: "Senate Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-10", detail: "Assembly Floor" },
      { step: 8, label: "Signed", date: "2025-09-20", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-648", number: "SB 648", chamber: "Senate",
    title: "Tip and Gratuity Enforcement",
    author: "Lola Smallwood-Cuevas", authorParty: "D", authorDistrict: "SD-28", authorRegion: "South LA / Baldwin Hills",
    summary: "Gives the Labor Commissioner real enforcement power over tip theft for the first time. Employers who steal tips can now be cited and fined instead of requiring workers to sue individually.",
    topics: ["Labor & Workers' Rights"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-19", lastAction: "2025-07-30", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Tip theft affects workers in food service and hospitality, majority Latino/a/e, Black, and immigrant workforces. Women workers in tipped occupations face compounded vulnerability: gender-based harassment is often tolerated because workers depend on tips.",
    race: ["Latino/a/e", "Immigrants", "Black"],
    gender: true, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB648",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-19", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-02", detail: "Senate Labor Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-05-28", detail: "Senate Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-07-09", detail: "Assembly Floor" },
      { step: 8, label: "Signed", date: "2025-07-30", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-513", number: "SB 513", chamber: "Senate",
    title: "Personnel Records: Training Documentation",
    author: "Mar\u00eda Elena Durazo", authorParty: "D", authorDistrict: "SD-26", authorRegion: "Central LA / East LA",
    summary: "Requires employers to document training they provide and give workers access to those records. Before this, workers often could not prove skills gained on the job.",
    topics: ["Labor & Workers' Rights"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-18", lastAction: "2025-10-11", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Training documentation empowers workers to demonstrate qualifications. Black and Latino/a/e workers often receive less formal recognition for on-the-job training, limiting upward mobility. This is core workforce development infrastructure.",
    race: ["Black", "Latino/a/e"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB513",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-18", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-26", detail: "Senate Labor Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-05-28", detail: "Senate Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-08", detail: "Assembly Floor" },
      { step: 8, label: "Signed", date: "2025-10-11", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "AB-250", number: "AB 250", chamber: "Assembly",
    title: "Extended SOL: Sexual Assault Claims",
    author: "Cecilia Aguiar-Curry", authorParty: "D", authorDistrict: "AD-04", authorRegion: "Woodland / Napa / Lake",
    summary: "Gives sexual assault survivors more time to file lawsuits by extending the revival window for previously expired claims through 2027. Helps survivors who could not report at the time.",
    topics: ["Civil Rights & Voting", "Criminal Justice"],
    status: "Signed into Law",
    dateIntroduced: "2025-01-22", lastAction: "2025-10-13", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Sexual assault disproportionately affects women of color and LGBTQ+ individuals who face compounded barriers to reporting: fear of immigration enforcement, distrust of police, lack of access to legal counsel. Extended statutes give survivors more time to come forward.",
    race: ["Black", "Latino/a/e", "Indigenous"],
    gender: true, lgbtq: true, disability: false, workingClass: false,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB250",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-01-22", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-11", detail: "Assembly Judiciary Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-05-22", detail: "Assembly Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-08", detail: "Senate Floor" },
      { step: 8, label: "Signed", date: "2025-10-13", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "AB-130", number: "AB 130", chamber: "Assembly",
    title: "CEQA Infill Housing Exemption",
    author: "Buffy Wicks", authorParty: "D", authorDistrict: "AD-14", authorRegion: "Oakland / East Bay",
    summary: "Exempts qualifying urban infill housing projects from full California Environmental Quality Act (CEQA) review. Projects must be on previously developed land within existing urbanized areas. Designed to accelerate housing construction in cities facing severe shortages.",
    topics: ["Housing & Homelessness", "Environment & Climate"],
    status: "Signed into Law",
    dateIntroduced: "2025-01-06", lastAction: "2025-09-26", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "mixed",
    equityRationale: "CEQA reform is a genuine tension in equity politics. Environmental review has been used by wealthy neighborhoods to block affordable housing near transit, deepening segregation. But CEQA is also the primary tool communities of color use to fight polluting facilities sited in their neighborhoods. This exemption could accelerate affordable housing OR luxury development that displaces existing residents — the equity impact depends entirely on implementation.",
    race: ["Black", "Latino/a/e"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB130",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-01-06", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-26", detail: "Assembly Housing Committee" },
      { step: 4, label: "Floor (1st)", date: "2025-06-04", detail: "Assembly Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-11", detail: "Senate Floor" },
      { step: 8, label: "Signed", date: "2025-09-26", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "AB-825", number: "AB 825", chamber: "Assembly",
    title: "Western Regional Energy Market",
    author: "Cottie Petrie-Norris", authorParty: "D", authorDistrict: "AD-73", authorRegion: "Irvine / Costa Mesa",
    summary: "Moves California toward joining a regional energy grid with other Western states, which could lower electricity costs and reduce price spikes during heat waves.",
    topics: ["Environment & Energy"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-20", lastAction: "2025-09-26", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Energy costs disproportionately burden low-income communities of color in the Inland Empire, Central Valley, and South LA, which experience both the highest energy costs and worst air quality. Regional grid integration can reduce costs while accelerating clean energy transition.",
    race: ["Latino/a/e", "Black"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB825",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-20", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-16", detail: "Assembly Utilities & Energy" },
      { step: 4, label: "Floor (1st)", date: "2025-06-04", detail: "Assembly Floor" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-11", detail: "Senate Floor" },
      { step: 8, label: "Signed", date: "2025-09-26", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-294", number: "SB 294", chamber: "Senate",
    title: "Workplace Know Your Rights Act",
    author: "Eloise G\u00f3mez Reyes", authorParty: "D", authorDistrict: "SD-29", authorRegion: "Colton / Inland Empire",
    summary: "Requires employers to give every worker a written notice of their rights, including protections during immigration raids, workers' comp, and the right to organize. Also requires emergency contact protocols if workers are arrested or detained on the job.",
    topics: ["Labor & Workers' Rights", "Immigration"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-06", lastAction: "2025-10-12", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "advances",
    equityRationale: "Workers in low-wage industries, disproportionately Black, Latino/a/e, and immigrant, are least likely to know their workplace rights. The immigration-related provisions are critical at a time when federal immigration enforcement is targeting workplaces in communities of color.",
    race: ["Black", "Latino/a/e", "Immigrants"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB294",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-06", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-04-02", detail: "Senate Labor Committee" },
      { step: 3, label: "Fiscal", date: "2025-05-19", detail: "Senate Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-05-29", detail: "Senate Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-07-09", detail: "Assembly Labor & Employment" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-10", detail: "Assembly Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-18", detail: "Enrolled and sent to Governor" },
      { step: 8, label: "Signed", date: "2025-10-12", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-286", number: "SB 286", chamber: "Senate",
    title: "Mary-Bella's Law: Sex Offender Elderly Parole Exclusion",
    author: "Brian Jones", authorParty: "R", authorDistrict: "SD-40", authorRegion: "Santee / East San Diego County",
    summary: "Excludes people convicted of sex offenses from California's elderly parole program. Named after Mary-Bella, a victim of a sex crime committed by an elderly parolee. Closes what supporters call a loophole that allowed sex offenders over 50 to receive early parole consideration.",
    topics: ["Policing & Criminal Justice"],
    status: "Signed into Law",
    dateIntroduced: "2025-02-10", lastAction: "2025-10-01", lastActionText: "Signed by Governor Newsom",
    equityProximity: "structural", equityDirection: "threatens",
    equityRationale: "Elderly parole was designed partly to address mass incarceration's racial impact: Black and Latino men are dramatically overrepresented among California's aging prison population. Excluding sex offenses from elderly parole narrows a release valve that disproportionately benefits incarcerated people of color, even though the bill does not mention race.",
    race: ["Black", "Latino/a/e"],
    gender: false, lgbtq: false, disability: false, workingClass: false,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB286",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-10", detail: "Read first time" },
      { step: 2, label: "Committee", date: "2025-03-25", detail: "Senate Public Safety Committee" },
      { step: 3, label: "Fiscal", date: "2025-05-05", detail: "Senate Appropriations" },
      { step: 4, label: "Floor (1st)", date: "2025-05-28", detail: "Senate Floor" },
      { step: 5, label: "2nd Chamber", date: "2025-07-08", detail: "Assembly Public Safety Committee" },
      { step: 6, label: "Floor (2nd)", date: "2025-09-09", detail: "Assembly Floor" },
      { step: 7, label: "Enrolled", date: "2025-09-16", detail: "Enrolled and sent to Governor" },
      { step: 8, label: "Signed", date: "2025-10-01", detail: "Signed by Governor Newsom" },
    ],
  },
  {
    id: "SB-432", number: "SB 432", chamber: "Senate",
    title: "Enhanced Fentanyl Penalties: Sales to Minors",
    author: "Kelly Seyarto", authorParty: "R", authorDistrict: "SD-32", authorRegion: "Murrieta / SW Riverside",
    summary: "Would classify furnishing fentanyl to a minor as a serious felony, making offenders ineligible for plea bargaining or probation and subject to a five-year sentence enhancement. Originally proposed as a strike under the Three Strikes law but amended in committee. Supporters frame it as protecting children from an unprecedented overdose crisis; opponents warn enhanced sentences replicate the crack-era sentencing disparities that devastated Black communities.",
    topics: ["Policing & Criminal Justice", "Health & Public Health"],
    status: "Failed in Committee",
    dateIntroduced: "2025-02-20", lastAction: "2025-05-23", lastActionText: "Held in Senate Appropriations suspense file",
    equityProximity: "structural", equityDirection: "mixed",
    equityRationale: "Mandatory minimums and sentence enhancements have a documented history of disproportionate enforcement against Black and Latino communities. The fentanyl crisis, however, is devastating communities across racial lines, and children in low-income communities of color face elevated risk. Whether this bill would protect or harm communities of color depends on how selectively prosecutors deploy these enhanced charges — the same tension that defined crack vs. powder cocaine sentencing.",
    race: ["Black", "Latino/a/e"],
    gender: false, lgbtq: false, disability: false, workingClass: true,
    url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260SB432",
    year: 2025,
    lifecycle: [
      { step: 1, label: "Introduced", date: "2025-02-20", detail: "Read first time, assigned to Public Safety" },
      { step: 2, label: "Committee", date: "2025-04-01", detail: "Passed Senate Public Safety 6-0, amended down from strike to serious felony" },
      { step: 3, label: "Fiscal", date: "2025-05-23", detail: "Held on Senate Appropriations suspense file" },
    ],
  },
];


// ============================================================
// DATA NORMALIZATION — maps pipeline JSON → component shape
// ============================================================
function normalizeBill(bill) {
  const rawNum = bill.bill_number || "";
  const number = rawNum.replace(/^([A-Za-z]+)\s*(\d+)$/, "$1 $2") || rawNum;
  const chamber = /^(AB|ABX|ACR|ACA|AJR|AR)/i.test(rawNum) ? "Assembly"
    : /^(SB|SBX|SCR|SCA|SR)/i.test(rawNum) ? "Senate" : "Other";

  const primarySponsor = (bill.sponsors || [])[0] || {};

  // Infer topics from title + description since LegiScan subjects field is empty
  const titleDesc = ((bill.title || "") + " " + (bill.description || "")).toLowerCase();
  const topicRules = [
    ["Labor & Workers' Rights",    /\b(labor|worker|wage|employ|union|bargain|workplace|workers.comp|tip|layoff|overtime|paid leave|hiring)/],
    ["Education (K-12)",           /\b(school|k-12|pupil|student|teacher|curriculum|classroom|charter school|transitional kindergarten)/],
    ["Higher Education",           /\b(university|college|community college|financial aid|student loan|campus|higher education|uc |csu )/],
    ["Housing & Homelessness",     /\b(hous|rent|tenant|landlord|homeless|evict|affordable housing|zoning|ceqa|infill)/],
    ["Policing & Criminal Justice",/\b(police|criminal justice|prison|parole|incarcerat|sentenc|felony|probation|arrest|detain|law enforcement)/],
    ["Immigration",                /\b(immigr|undocumented|visa|\bice\b|asylum|daca|migrant|citizenship)/],
    ["Health & Public Health",     /\b(health|medical|medi-cal|mental health|hospital|clinic|pharmaceutical|drug|cannabis|overdose|vaccine)/],
    ["Civil Rights & Voting",      /\b(civil rights|voting|election|discriminat|equal pay|bias|harassment|hate crime|ballot)/],
    ["Environment & Climate",      /\b(environment|climate|carbon|emissions|wildfire|drought|pollution|clean energy)/],
    ["Technology & AI",            /\b(artificial intelligence|\bai\b|algorithm|automat|data privacy|deepfake|technolog|cybersecurity|social media)/],
    ["Economic Development",       /\b(economic|business|small business|entrepreneur|commerce|workforce development|tax credit|\bgrant\b)/],
    ["Transportation",             /\b(transport|highway|transit|vehicle|road|rail|\buber\b|\blyft\b|rideshare|truck|\bbus\b)/],
    ["Food & Agriculture",         /\b(food|farm|agricultur|calfresh|nutrition|pesticide|crop|livestock)/],
    ["Children & Families",        /\b(child|family|families|foster|adoption|youth|juvenile|daycare|childcare|parent)/],
    ["Disability Services",        /\b(disabilit|\bada\b|accessibility|blind|deaf|developmental)/],
  ];
  const inferredTopics = topicRules
    .filter(([, re]) => re.test(titleDesc))
    .map(([label]) => label);
  const topics = inferredTopics.length > 0 ? inferredTopics
    : (bill.subjects || []).map(s => (typeof s === "string" ? s : s.subject_name || s.name || "")).filter(Boolean);

  const eq = bill.equity_analysis || {};
  const proximityMap = {
    "DIRECT EQUITY IMPACT": "explicit",
    "STRUCTURAL EQUITY IMPACT": "structural",
    "EQUITY RELEVANT": "structural",
  };
  const equityProximity = proximityMap[eq.classification] || null;
  const equityDirection = equityProximity ? "advances" : null;

  // Normalize population names — match by keyword within the string
  const POP_RULES = [
    [/black|african.american/i, "Black"],
    [/latin[oa]|hispanic|latinx|latino\/a/i, "Latino/a/e"],
    [/\basian|aapi|pacific.islander/i, "Asian"],
    [/indigenous|native.american|tribal|american.indian/i, "Indigenous"],
    [/immigr|undocumented/i, "Immigrants"],
    [/\bmena\b|middle.eastern|\barab/i, "MENA"],
    [/\bwomen\b|gender.nonconform/i, "Gender"],
    [/lgbtq|transgender|\bqueer\b/i, "LGBTQ+"],
    [/disabilit|disabled|blind|deaf/i, "Disability"],
    [/working.class|low.income|low-wage|working poor/i, "Working-class"],
  ];
  const race = [...new Set(
    (eq.key_populations || []).flatMap(p =>
      POP_RULES.filter(([re]) => re.test(p)).map(([, tag]) => tag)
    ).filter(Boolean)
  )];

  const lc = bill.lifecycle || {};
  const steps = [];
  if (lc.introduced_date) steps.push({ step: 1, label: "Introduced", date: lc.introduced_date, detail: "Read first time" });
  if (lc.committee_dates?.[0]) steps.push({ step: 2, label: "Committee", date: lc.committee_dates[0], detail: "In Committee" });
  if (lc.floor_dates?.[0]) steps.push({ step: 4, label: "Floor (1st)", date: lc.floor_dates[0], detail: "Floor vote" });
  if (lc.passed_house && !lc.floor_dates?.[0]) steps.push({ step: 4, label: "Floor (1st)", date: lc.passed_house, detail: "Passed chamber" });
  if (lc.passed_senate) steps.push({ step: 5, label: "2nd Chamber", date: lc.passed_senate, detail: "Passed second chamber" });
  if (lc.signed_date) steps.push({ step: 8, label: "Signed", date: lc.signed_date, detail: "Signed by Governor" });
  if (lc.vetoed_date) steps.push({ step: 8, label: "Vetoed", date: lc.vetoed_date, detail: "Vetoed by Governor" });
  if (lc.died_date) steps.push({ step: 3, label: "Failed", date: lc.died_date, detail: "Failed" });

  const statusMap = {
    signed: "Signed into Law", vetoed: "Vetoed", died: "Failed in Committee",
    passed_both: "Passed Legislature", passed_one_chamber: "Passed Legislature",
    in_floor_process: "In Progress", in_committee: "In Progress", introduced: "In Progress",
  };
  const status = statusMap[lc.current_status] || bill.status_desc || "In Progress";

  const sortedSteps = [...steps].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const lastStep = sortedSteps[0];

  return {
    id: String(bill.bill_id || rawNum),
    number,
    chamber,
    title: bill.title || "",
    author: primarySponsor.name || "Unknown",
    authorParty: primarySponsor.party || "?",
    authorDistrict: "",
    authorRegion: "",
    summary: (() => {
      // Priority: AI-generated plain summary > "relating to X" extract > raw description
      if (eq.summary) return eq.summary;
      const m = (bill.description || "").match(/(?:,\s*|An act\s+)relating to ([^,\.]+)/i);
      if (m) return m[1].trim().replace(/^\w/, c => c.toUpperCase());
      return bill.description || bill.title || "";
    })(),
    topics,
    status,
    dateIntroduced: lc.introduced_date || "",
    lastAction: lastStep?.date || "",
    lastActionText: lastStep?.detail || "",
    equityProximity,
    equityDirection,
    equityRationale: eq.rationale || "",
    race: race.filter(p => ["Black","Latino/a/e","Asian","Indigenous","Immigrants","MENA"].includes(p)),
    gender: race.includes("Gender"),
    lgbtq: race.includes("LGBTQ+"),
    disability: race.includes("Disability"),
    workingClass: race.includes("Working-class"),
    url: bill.url || bill.state_link || "",
    year: (() => {
      // LegiScan leaves introduced_date null for ~half the dataset — fall back to
      // the earliest known activity date so bills land in the correct session year.
      const dates = [lc.introduced_date, ...(lc.committee_dates || []), ...(lc.floor_dates || [])];
      (bill.texts || []).forEach(t => t.date && dates.push(t.date));
      ["passed_house", "passed_senate", "signed_date", "vetoed_date", "died_date"].forEach(k => lc[k] && dates.push(lc[k]));
      const earliest = dates.filter(Boolean).sort()[0];
      const y = earliest ? parseInt(earliest.slice(0, 4)) : 2025;
      // Bills pre-filed in December before the session convenes still count as Year 1.
      return y < 2025 ? 2025 : y;
    })(),
    lifecycle: steps,
  };
}

// ============================================================
// CONSTANTS & SHARED UI COMPONENTS
// ============================================================
const ALL_TOPICS = [
  "Labor & Workers' Rights", "Education (K-12)", "Higher Education", "Housing & Homelessness",
  "Policing & Criminal Justice", "Immigration", "Health & Public Health", "Civil Rights & Voting",
  "Environment & Climate", "Environment & Energy", "Technology & AI", "Economic Development", "Food & Agriculture",
  "Transportation", "Public Safety", "Water", "Tribal Affairs", "Disability Services",
  "Veterans", "Government & Elections", "Consumer Protection", "Children & Families",
];
const RACE_TAGS = ["Black", "Latino/a/e", "Asian", "Indigenous", "Immigrants", "MENA"];
const INTERSECTIONAL = ["Gender", "LGBTQ+", "Disability", "Working-class"];
const EQUITY_PROXIMITY = { explicit: "Explicit", structural: "Structural" };
const EQUITY_DIRECTION = { advances: "Advances equity", threatens: "Threatens equity", mixed: "Mixed" };
const STATUS_OPTS = ["Signed into Law", "Vetoed", "Passed Legislature", "Referred to Ballot", "Failed in Committee"];
const COLORS = {
  "Black": "#C62828", "Latino/a/e": "#E65100", "Asian": "#6A1B9A", "Indigenous": "#2E7D32",
  "Immigrants": "#0277BD", "MENA": "#00695C", "Gender": "#AD1457", "LGBTQ+": "#7B1FA2",
  "Disability": "#1565C0", "Working-class": "#4E342E",
  explicit: "#D50000", structural: "#E65100",
  advances: "#00C853", threatens: "#FF1744", mixed: "#F9A825",
};

// ============================================================
// SMALL COMPONENTS
// ============================================================
function Chip({ label, color, small }) {
  return <span style={{ background: color || "#333", color: "#fff", padding: small ? "2px 6px" : "3px 8px", borderRadius: "2px", fontSize: small ? "11px" : "12px", fontWeight: 600, letterSpacing: "0.2px", fontFamily: "var(--m)", whiteSpace: "nowrap" }}>{label}</span>;
}

function FilterBtn({ label, active, onClick, color }) {
  return <button onClick={onClick} style={{ background: active ? (color || "#D50000") : "transparent", color: active ? "#fff" : "#888", border: `1px solid ${active ? "transparent" : "#2a2a2a"}`, padding: "5px 11px", borderRadius: "2px", fontSize: "13px", fontFamily: "var(--m)", fontWeight: 600, cursor: "pointer", transition: "all 0.1s", whiteSpace: "nowrap" }}>{label}</button>;
}

function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
          background: "#1a1a1a", border: "1px solid #333", padding: "6px 10px", borderRadius: "3px",
          fontSize: "12px", color: "#ccc", fontFamily: "var(--m)", whiteSpace: "normal",
          zIndex: 100, pointerEvents: "none", lineHeight: 1.4, minWidth: "140px", maxWidth: "240px", textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}>
          <div dangerouslySetInnerHTML={{ __html: text }} />
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #333" }} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// COUNTDOWN TICKER
// ============================================================
function CountdownTicker({ target }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = new Date(target).getTime() - now;
  const past = diff <= 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hrs = Math.floor((abs % 86400000) / 3600000);
  const mins = Math.floor((abs % 3600000) / 60000);
  const secs = Math.floor((abs % 60000) / 1000);
  const units = [["DAYS", days], ["HRS", hrs], ["MIN", mins], ["SEC", secs]];
  return (
    <div>
      {past && <div style={{ fontFamily: "var(--m)", fontSize: "10px", color: "#00E676", letterSpacing: "1px", marginBottom: "8px", fontWeight: 700 }}>DEADLINE PASSED — UPDATE INCOMING</div>}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        {units.map(([label, val]) => (
          <div key={label} style={{ background: "#111", border: "1px solid #1e1e1e", padding: "10px 14px", minWidth: "60px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--s)", fontSize: "26px", color: past ? "#00E676" : "#D50000", fontWeight: 700, lineHeight: 1 }}>{String(val).padStart(2, "0")}</div>
            <div style={{ fontFamily: "var(--m)", fontSize: "11px", color: "#888", letterSpacing: "1.5px", marginTop: "4px", fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </div>
      {!past && <div style={{ fontFamily: "var(--b)", fontSize: "13px", color: "#666", marginTop: "8px" }}>until first 2026 bills drop</div>}
    </div>
  );
}

// ============================================================
// DROPDOWN MULTISELECT
// ============================================================
function DropdownMulti({ label, selected, onChange, options, year, countFn }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const toggle = (t) => onChange(selected.includes(t) ? selected.filter(x => x !== t) : [...selected, t]);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        background: "#111", border: `1px solid ${selected.length ? "#D50000" : "#2a2a2a"}`, color: selected.length ? "#fff" : "#666",
        padding: "8px 14px", fontFamily: "var(--m)", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", minWidth: "200px",
      }}>
        <span>{label} {selected.length > 0 && `(${selected.length})`}</span>
        <span style={{ marginLeft: "auto", fontSize: "11px" }}>{open ? "\u25B2" : "\u25BC"}</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, background: "#111", border: "1px solid #2a2a2a",
          zIndex: 50, maxHeight: "320px", overflowY: "auto", minWidth: "280px", boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}>
          {options.length > 8 && <div style={{ padding: "6px 8px", borderBottom: "1px solid #1a1a1a" }}>
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #222", color: "#fff", padding: "5px 8px", fontSize: "13px", fontFamily: "var(--m)", outline: "none" }} />
          </div>}
          {selected.length > 0 && <div style={{ padding: "6px 10px", borderBottom: "1px solid #1a1a1a" }}>
            <button onClick={() => onChange([])} style={{ background: "none", border: "none", color: "#D50000", fontFamily: "var(--m)", fontSize: "12px", cursor: "pointer", fontWeight: 700 }}>CLEAR</button>
          </div>}
          {filtered.map(t => {
            const count = countFn ? countFn(t) : null;
            const active = selected.includes(t);
            return (
              <label key={t} style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", cursor: "pointer",
                background: active ? "#1a0800" : "transparent", borderBottom: "1px solid #151515",
                opacity: count === 0 ? 0.4 : 1,
              }}
                onClick={() => toggle(t)}>
                <div style={{
                  width: "14px", height: "14px", border: `2px solid ${active ? "#D50000" : "#333"}`,
                  background: active ? "#D50000" : "transparent", borderRadius: "2px",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {active && <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>{"\u2713"}</span>}
                </div>
                <span style={{ fontFamily: "var(--m)", fontSize: "13px", color: active ? "#fff" : "#888", flex: 1 }}>{t}</span>
                {count !== null && <span style={{ fontFamily: "var(--m)", fontSize: "12px", color: "#666" }}>{count}</span>}
              </label>
            );
          })}
        </div>
      )}
      {selected.length > 0 && (
        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginTop: "6px" }}>
          {selected.map(t => (
            <span key={t} onClick={() => toggle(t)} style={{
              background: "#1a0800", color: "#FF8A65", border: "1px solid #D5000044", padding: "2px 8px",
              borderRadius: "2px", fontSize: "12px", fontFamily: "var(--m)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
            }}>
              {t} <span style={{ color: "#D50000" }}>{"\u00D7"}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


// ============================================================
// BILL TRACKER COMPONENTS
// ============================================================
function BillLifecycle({ bill }) {
  const steps = bill.lifecycle || [];
  const maxStep = Math.max(...steps.map(s => s.step));
  const failed = bill.status === "Failed in Committee";
  const vetoed = bill.status === "Vetoed";
  const LABELS = ["", "Introduced", "Committee", "Fiscal", "Floor (1st)", "2nd Chamber", "Floor (2nd)", "Enrolled", "Governor"];
  const ICONS = ["","\u{1F4CB}","\u{1F3DB}\uFE0F","\u{1F4B0}","\u{1F5F3}\uFE0F","\u{1F504}","\u{1F5F3}\uFE0F","\u{1F4E8}","\u270D\uFE0F"];

  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
        {LABELS.slice(1).map((lbl, i) => {
          const n = i + 1;
          const stepData = steps.find(s => s.step === n);
          const on = n <= maxStep;
          const current = n === maxStep;
          const isFail = failed && stepData && n === Math.max(...steps.map(s => s.step));
          const isVeto = vetoed && n === 8;
          let dot = "#222";
          if (isFail || isVeto) dot = "#B71C1C";
          else if (current) dot = "#00E676";
          else if (on) dot = "#D50000";

          const tooltipHtml = stepData
            ? `<div style="font-weight:700;color:#fff">${stepData.label}</div><div style="color:#F9A825;margin:2px 0">${stepData.date}</div><div style="color:#aaa;font-size:10px;white-space:normal;max-width:220px">${stepData.detail}</div>`
            : `<div style="color:#555">${lbl}</div>`;

          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              {i > 0 && <div style={{ position: "absolute", top: "12px", left: "-50%", width: "100%", height: "2px", background: on ? (isFail || isVeto ? "#B71C1C" : "#D50000") : "#1a1a1a", zIndex: 0 }} />}
              <Tooltip text={tooltipHtml}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%", background: dot,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px",
                  zIndex: 1, position: "relative", cursor: "pointer",
                  boxShadow: current ? `0 0 8px ${dot}` : "none",
                  border: current ? "2px solid #fff" : "2px solid transparent",
                }}>
                  {isFail ? "\u{1F480}" : isVeto ? "\u274C" : stepData ? ICONS[n] : "\u25CB"}
                </div>
              </Tooltip>
              <div style={{ fontSize: "10px", textAlign: "center", marginTop: "4px", color: on ? "#aaa" : "#555", fontFamily: "var(--m)", lineHeight: 1.1, fontWeight: current ? 700 : 400, maxWidth: "60px" }}>{lbl}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// EQUITY BADGE
// ============================================================
function EquityBadge({ proximity, direction }) {
  const pColor = proximity === "explicit" ? "#D50000" : "#E65100";
  const dColor = direction === "advances" ? "#00C853" : direction === "threatens" ? "#FF1744" : "#F9A825";
  const dLabel = direction === "advances" ? "\u2191 Advances" : direction === "threatens" ? "\u2193 Threatens" : "\u2194 Mixed";
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      <span style={{ background: pColor, color: "#fff", padding: "2px 7px", borderRadius: "2px 0 0 2px", fontSize: "11px", fontWeight: 700, fontFamily: "var(--m)", textTransform: "uppercase" }}>{proximity}</span>
      <span style={{ background: dColor, color: direction === "mixed" ? "#000" : "#fff", padding: "2px 7px", borderRadius: "0 2px 2px 0", fontSize: "11px", fontWeight: 700, fontFamily: "var(--m)" }}>{dLabel}</span>
    </span>
  );
}

// ============================================================
// BILL LIST CARD (minimal)
// ============================================================
function BillListItem({ bill, onOpen, starred, onStar }) {
  const accent = bill.chamber === "Senate" ? "#D50000" : "#F9A825";
  const statusColor = bill.status === "Signed into Law" ? "#00E676" : bill.status === "Vetoed" ? "#FF1744" : bill.status.includes("Failed") ? "#FF6D00" : "#F9A825";
  return (
    <div onClick={onOpen} style={{ background: "#0c0c0c", border: "1px solid #181818", borderLeft: `3px solid ${accent}`, padding: "14px 18px", cursor: "pointer", transition: "background 0.12s", marginBottom: "1px", display: "flex", alignItems: "center", gap: "12px" }}
      onMouseEnter={e => e.currentTarget.style.background = "#131313"} onMouseLeave={e => e.currentTarget.style.background = "#0c0c0c"}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "3px" }}>
          <span style={{ fontFamily: "var(--m)", fontWeight: 700, fontSize: "14px", color: accent }}>{bill.number}</span>
          <span style={{ fontFamily: "var(--s)", fontSize: "16px", fontWeight: 600, color: "#eee" }}>{bill.title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", color: "#aaa", fontFamily: "var(--m)" }}>{bill.author} <span style={{ color: bill.authorParty === "D" ? "#42A5F5" : "#EF5350", fontWeight: 700 }}>({bill.authorParty})</span></span>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
          <EquityBadge proximity={bill.equityProximity} direction={bill.equityDirection} />
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onStar(bill.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", padding: "4px", color: starred ? "#F9A825" : "#333", transition: "color 0.1s" }}
        title={starred ? "Remove from watchlist" : "Add to watchlist"}>
        {starred ? "\u2605" : "\u2606"}
      </button>
    </div>
  );
}

// ============================================================
// BILL MODAL
// ============================================================
function BillModal({ bill, onClose, starred, onStar, admin }) {
  if (!bill) return null;
  const accent = bill.chamber === "Senate" ? "#D50000" : "#F9A825";
  const RACE_TAGS = ["Black", "Latino/a/e", "Asian", "Indigenous", "Immigrants", "MENA"];
  const PROX = { explicit: "Explicit", structural: "Structural" };
  const DIR = { advances: "Advances equity", threatens: "Threatens equity", mixed: "Mixed" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0c0c0c", border: "1px solid #222", borderTop: `3px solid ${accent}`, maxWidth: "680px", width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "24px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--m)", fontWeight: 700, fontSize: "16px", color: accent }}>{bill.number}</span>
              <span style={{ background: accent, color: bill.chamber === "Senate" ? "#fff" : "#000", padding: "2px 8px", borderRadius: "2px", fontSize: "11px", fontWeight: 700, fontFamily: "var(--m)", letterSpacing: "1px" }}>{bill.chamber === "Senate" ? "SEN" : "ASM"}</span>
              <EquityBadge proximity={bill.equityProximity} direction={bill.equityDirection} />
              {admin && (
                <span style={{ display: "inline-flex", gap: "4px", marginLeft: "4px" }}>
                  <EditableSelect admin={admin} id={`${bill.id}_proximity`} value={bill.equityProximity} options={PROX} style={{ fontSize: "9px" }} />
                  <EditableSelect admin={admin} id={`${bill.id}_direction`} value={bill.equityDirection} options={DIR} style={{ fontSize: "9px" }} />
                </span>
              )}
            </div>
            <h2 style={{ fontFamily: "var(--s)", fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.3 }}>
              {admin ? <Editable admin={admin} id={`${bill.id}_title`} style={{ fontFamily: "var(--s)", fontSize: "20px", fontWeight: 700, color: "#fff" }}>{bill.title}</Editable> : bill.title}
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
            <button onClick={() => onStar(bill.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: starred ? "#F9A825" : "#444" }}>
              {starred ? "\u2605" : "\u2606"}
            </button>
            <button onClick={onClose} style={{ background: "#222", border: "none", color: "#888", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", fontFamily: "var(--m)", fontWeight: 700 }}>{"\u00D7"}</button>
          </div>
        </div>

        <div style={{ fontSize: "13px", color: "#aaa", fontFamily: "var(--m)", marginBottom: "14px" }}>
          <span style={{ color: "#ddd" }}>{bill.author}</span>
          <span style={{ color: bill.authorParty === "D" ? "#42A5F5" : "#EF5350", fontWeight: 700, marginLeft: "4px" }}>({bill.authorParty})</span>
          <span style={{ color: "#777", marginLeft: "6px" }}>{bill.authorDistrict} {"\u00B7"} {bill.authorRegion}</span>
        </div>

        <div style={{ fontSize: "12px", fontWeight: 700, fontFamily: "var(--m)", color: bill.status === "Signed into Law" ? "#00E676" : bill.status === "Vetoed" ? "#FF1744" : bill.status.includes("Failed") ? "#FF6D00" : "#F9A825", marginBottom: "12px" }}>
          {bill.status.toUpperCase()} {"\u00B7"} {bill.lastActionText}
        </div>

        {admin ? (
          <Editable admin={admin} id={`${bill.id}_summary`} multiline style={{ color: "#bbb", fontSize: "14px", lineHeight: 1.65, marginBottom: "14px", fontFamily: "var(--b)" }}>{bill.summary}</Editable>
        ) : (
          <p style={{ color: "#bbb", fontSize: "14px", lineHeight: 1.65, marginBottom: "14px", fontFamily: "var(--b)" }}>{bill.summary}</p>
        )}

        <div style={{ background: "#0f0600", border: "1px solid #D5000030", padding: "12px 14px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#D50000", fontFamily: "var(--m)", marginBottom: "6px", letterSpacing: "1px" }}>
            {"\uD83D\uDD0D"} AI-ASSESSED EQUITY ANALYSIS {"\u00B7"} {(bill.equityProximity || "").toUpperCase()} {"\u00B7"} {(bill.equityDirection || "").toUpperCase()}
          </div>
          {admin ? (
            <Editable admin={admin} id={`${bill.id}_rationale`} multiline style={{ color: "#FFAB91", fontSize: "14px", lineHeight: 1.55, fontFamily: "var(--b)", fontStyle: "italic" }}>{bill.equityRationale}</Editable>
          ) : (
            <p style={{ color: "#FFAB91", fontSize: "14px", lineHeight: 1.55, margin: 0, fontFamily: "var(--b)", fontStyle: "italic" }}>{bill.equityRationale}</p>
          )}
        </div>

        {admin && (
          <>
            <EditableTags admin={admin} id={`${bill.id}_race`} tags={bill.race} allTags={RACE_TAGS} colorFn={t => COLORS[t]} label="EDIT IDENTITY TAGS" />
            <EditableTags admin={admin} id={`${bill.id}_topics`} tags={bill.topics} allTags={ALL_TOPICS} label="EDIT POLICY AREAS" />
          </>
        )}

        <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginBottom: "14px" }}>
          {bill.race.map(t => <Chip key={t} label={t} color={COLORS[t]} />)}
          {bill.gender && <Chip label="Gender" color={COLORS["Gender"]} />}
          {bill.lgbtq && <Chip label="LGBTQ+" color={COLORS["LGBTQ+"]} />}
          {bill.disability && <Chip label="Disability" color={COLORS["Disability"]} />}
          {bill.workingClass && <Chip label="Working-class" color={COLORS["Working-class"]} />}
          {bill.topics.map(t => <span key={t} style={{ background: "#141414", color: "#888", padding: "3px 8px", borderRadius: "2px", fontSize: "12px", fontFamily: "var(--m)", border: "1px solid #1e1e1e" }}>{t}</span>)}
        </div>

        <div style={{ fontSize: "11px", fontWeight: 700, color: "#777", fontFamily: "var(--m)", marginBottom: "2px", letterSpacing: "1px" }}>BILL LIFECYCLE {"\u00B7"} HOVER FOR DETAILS</div>
        <BillLifecycle bill={bill} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
          <span style={{ fontSize: "12px", color: "#777", fontFamily: "var(--m)" }}>{bill.lastAction}</span>
          <a href={bill.url} target="_blank" rel="noopener noreferrer" style={{ color: "#D50000", fontSize: "13px", fontFamily: "var(--m)", fontWeight: 700, textDecoration: "none" }}>FULL TEXT ON LEGINFO {"\u2192"}</a>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// SACRAMENTO 101
// ============================================================
function Sacramento101({ admin }) {
  return (
    <div>
      <h2 style={{ fontFamily: "var(--s)", fontSize: "24px", fontWeight: 800, color: "#fff", margin: "0 0 6px 0" }}>Sacramento 101</h2>
      <p style={{ color: "#888", fontSize: "14px", fontFamily: "var(--m)", marginBottom: "16px" }}>How California's legislature works, and where equity bills live and die.</p>

      <Editable admin={admin} id="sac101_basics" multiline>
      <div style={{ background: "#0c0c0c", border: "1px solid #181818", padding: "16px", marginBottom: "10px" }}>
        <h3 style={{ fontFamily: "var(--m)", color: "#D50000", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", marginTop: 0, marginBottom: "10px" }}>THE BASICS</h3>
        <div style={{ color: "#aaa", fontSize: "15px", fontFamily: "var(--b)", lineHeight: 1.8 }}>
          <p style={{ marginTop: 0 }}>California has a <strong style={{ color: "#fff" }}>bicameral legislature</strong>: 40 Senators, 80 Assembly Members. Sessions span two years — the current session runs <strong style={{ color: "#F9A825" }}>2025 through 2026</strong>. This tracker covers all <strong style={{ color: "#F9A825" }}>4,863 bills</strong> introduced across both years of the session. In Year 1 alone (2025), legislators introduced roughly <strong style={{ color: "#F9A825" }}>2,500 bills</strong>. Of those, about <strong style={{ color: "#fff" }}>41%</strong> reached the Governor's desk. Governor Newsom signed <strong style={{ color: "#00E676" }}>roughly 87%</strong> of what reached him and vetoed <strong style={{ color: "#FF1744" }}>about 13%</strong>. That means roughly <strong style={{ color: "#FF6D00" }}>59% of all introduced bills died before ever reaching the Governor</strong>, most of them killed quietly in committee or on the suspense file. The Year 2 (2026) session is currently ongoing. Sources: <a href="https://calmatters.org" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>CalMatters</a>, <a href="https://capitolweekly.net" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>Capitol Weekly</a>.</p>
        </div>
      </div>
      </Editable>

      <div style={{ background: "#0c0c0c", border: "1px solid #181818", padding: "16px", marginBottom: "10px" }}>
        <h3 style={{ fontFamily: "var(--m)", color: "#D50000", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", marginTop: 0, marginBottom: "12px" }}>THE JOURNEY: HOW A BILL BECOMES LAW</h3>

        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "flex-start" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#D50000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{"\u{1F4CB}"}</div>
          <div>
            <div style={{ fontFamily: "var(--m)", color: "#F9A825", fontSize: "13px", fontWeight: 700 }}>STEP 1: INTRODUCTION</div>
            <div style={{ color: "#aaa", fontSize: "14px", fontFamily: "var(--b)", lineHeight: 1.6 }}>A legislator authors a bill, which receives a number: AB (Assembly Bill) or SB (Senate Bill). It gets a first reading on the floor and is assigned to a policy committee based on its subject matter. Any member of the public can read the bill text on leginfo.legislature.ca.gov from this point forward.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "flex-start" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#D50000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{"\u{1F3DB}\uFE0F"}</div>
          <div>
            <div style={{ fontFamily: "var(--m)", color: "#F9A825", fontSize: "13px", fontWeight: 700 }}>STEP 2: POLICY COMMITTEE</div>
            <div style={{ color: "#aaa", fontSize: "14px", fontFamily: "var(--b)", lineHeight: 1.6 }}>This is the first major hurdle, and where most bills die. The bill is heard by a policy committee (for example, the Senate Public Safety Committee or the Assembly Education Committee) that specializes in the bill's subject area. The committee process has several parts: first, the bill author presents the bill and its purpose. Then there is a public hearing where supporters and opponents testify, either in person at the Capitol, by phone, or in writing. Lobbyists, advocacy organizations, government agencies, and members of the public all weigh in. After testimony, committee members discuss the bill and vote. A bill needs a majority of the committee's members to advance. The committee chair has significant power to schedule or delay hearings. If a bill is never scheduled for a hearing, it dies without a vote. Of the roughly 2,250 bills introduced in 2025, most never made it past this stage.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "flex-start" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#D50000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{"\u{1F4B0}"}</div>
          <div>
            <div style={{ fontFamily: "var(--m)", color: "#F9A825", fontSize: "13px", fontWeight: 700 }}>STEP 3: APPROPRIATIONS & THE SUSPENSE FILE</div>
            <div style={{ color: "#aaa", fontSize: "14px", fontFamily: "var(--b)", lineHeight: 1.6 }}>If a bill costs money, it gets sent to the Appropriations Committee. Bills with costs above $150,000 (Assembly) or $50,000 (Senate) are placed on what is called the "suspense file." The suspense file is one of the most powerful and least transparent mechanisms in the entire legislative process. Hundreds of bills pile up on it. Then, twice a year, in late May and late August, the Appropriations Committee chair goes through the entire list and announces which bills will advance and which will die. This happens rapidly, often with minimal public debate. In 2025, the Assembly Appropriations Committee killed roughly 35% of the 666 bills on its May suspense file. Of the 2,403 bills that died during the previous two-year session (2023-2024), only 25 were killed by an actual recorded "no" vote on the floor. The rest died behind closed doors, many of them on the suspense file. This is the equity story: bills do not die because legislators publicly vote against them. They die because a single committee chair, behind closed doors, decides the state cannot afford them. And "too expensive" is often a political judgment, not purely a fiscal one.</div>
          </div>
        </div>

        {[
          { s: "4", t: "Floor Vote", d: "The full chamber (all 80 Assembly Members or all 40 Senators) debates and votes. Most bills need a simple majority to pass. Tax increases and urgency measures require a two-thirds supermajority. Floor votes are public and recorded, so you can see exactly how your representative voted.", i: "\u{1F5F3}\uFE0F" },
          { s: "5", t: "Second Chamber", d: "Once a bill passes one house, it crosses to the other and repeats the entire process: policy committee, appropriations (if applicable), and floor vote. This is why the June crossover deadline matters. Amendments in the second chamber may send the bill back to the first house for a concurrence vote.", i: "\u{1F504}" },
          { s: "6", t: "Governor's Desk", d: "The Governor has 12 days to sign the bill into law, veto it, or allow it to become law without a signature. In 2025, Governor Newsom signed 87% of the 917 bills that reached his desk and vetoed 13%. A two-thirds vote in both chambers can override a veto, but this is extremely rare in California.", i: "\u270D\uFE0F" },
          { s: "7", t: "Law", d: "Most signed bills take effect on January 1 of the following year. Urgency bills, which require a two-thirds vote, take effect immediately upon signing. The full text of every California law is available at leginfo.legislature.ca.gov.", i: "\u2696\uFE0F" },
        ].map(s => (
          <div key={s.s} style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "flex-start" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#D50000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{s.i}</div>
            <div><div style={{ fontFamily: "var(--m)", color: "#F9A825", fontSize: "13px", fontWeight: 700 }}>STEP {s.s}: {s.t.toUpperCase()}</div><div style={{ color: "#aaa", fontSize: "14px", fontFamily: "var(--b)", lineHeight: 1.6 }}>{s.d}</div></div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0c0c0c", border: "1px solid #181818", padding: "16px", marginBottom: "10px" }}>
        <h3 style={{ fontFamily: "var(--m)", color: "#D50000", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", marginTop: 0, marginBottom: "8px" }}>KEY DATES 2025-2026</h3>
        <p style={{ color: "#888", fontSize: "12px", fontFamily: "var(--m)", marginTop: 0, marginBottom: "10px" }}>Hover over any date for more detail on what it means and why it matters.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "8px" }}>
          {[
            ["Jan 6, 2025", "Session convenes ✓", "The two-year legislative session officially began. Legislators were sworn in and began introducing bills. California's legislature meets year-round, unlike many other states."],
            ["Feb 21, 2025", "Bill intro deadline (Yr 1) ✓", "Last day for legislators to introduce new bills in the first year of the session. After this date, no new bills could be submitted until the second year began. Roughly 2,500 bills were introduced in Year 1."],
            ["Jun 6, 2025", "Crossover deadline ✓", "Last day for a bill to pass its house of origin and cross over to the other chamber. Bills that missed this deadline were effectively dead for the year."],
            ["Sep 12, 2025", "Session adjourns (Yr 1) ✓", "The legislature adjourned for the year. All bills that passed both chambers were sent to the Governor. Bills that did not pass were carried over to 2026 as 'two-year bills.'"],
            ["Oct 12, 2025", "Governor signing deadline ✓", "Last day for the Governor to sign or veto bills. Newsom signed roughly 1,020 bills and vetoed 123. Bills he neither signed nor vetoed became law without his signature."],
            ["Jan 1, 2026", "2025 laws took effect ✓", "Most bills signed during the 2025 session took effect on this date. Urgency measures that passed with a two-thirds vote took effect immediately upon signing."],
            ["Feb 20, 2026", "Bill intro deadline (Yr 2) ✓", "Last day for legislators to introduce new bills for the second year of the session. All 2026 bills are now in this tracker. Year 2 tends to see fewer introductions — legislators focus on advancing their two-year bills."],
            ["Jun 2026", "Crossover deadline (Yr 2)", "Last day for a 2026 bill to pass its house of origin and move to the other chamber. Bills that don't cross over by this date are dead for the session."],
            ["Sep 2026", "Session adjourns (Yr 2)", "The full two-year session ends. Any bills that did not pass both chambers expire and must be reintroduced in the 2027-2028 session."],
            ["Oct 2026", "Governor signing deadline (Yr 2)", "Last day for the Governor to act on bills from the 2026 session. Bills signed here take effect January 1, 2027."],
          ].map(([d, e, tip]) => (
            <Tooltip key={d} text={tip}>
              <div style={{ display: "flex", gap: "8px", cursor: "help", padding: "4px 0" }}>
                <span style={{ fontFamily: "var(--m)", color: "#F9A825", fontSize: "12px", fontWeight: 700, minWidth: "120px" }}>{d}</span>
                <span style={{ color: "#aaa", fontSize: "13px", fontFamily: "var(--b)", borderBottom: "1px dotted #444" }}>{e}</span>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}


// ============================================================
// ABOUT PAGE
// ============================================================
function AboutPage({ admin }) {
  const [openSection, setOpenSection] = useState(null);
  const toggle = (s) => setOpenSection(openSection === s ? null : s);
  const Section = ({ id, title, children }) => (
    <div style={{ background: "#0c0c0c", border: "1px solid #181818", marginBottom: "6px" }}>
      <button onClick={() => toggle(id)} style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
        <span style={{ fontFamily: "var(--m)", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", color: "#D50000" }}>{title}</span>
        <span style={{ fontFamily: "var(--m)", fontSize: "12px", color: "#555" }}>{openSection === id ? "\u25B2" : "\u25BC"}</span>
      </button>
      {openSection === id && (
        <Editable admin={admin} id={`about_${id}`} multiline>
          <div style={{ padding: "0 16px 16px", color: "#aaa", fontSize: "15px", fontFamily: "var(--b)", lineHeight: 1.7 }}>{children}</div>
        </Editable>
      )}
    </div>
  );

  const energyUsed = 4.6;
  const energyCap = 17;
  const pct = Math.round((energyUsed / energyCap) * 100);

  return (
    <div>
      <h2 style={{ fontFamily: "var(--s)", fontSize: "24px", fontWeight: 800, color: "#fff", margin: "0 0 6px 0" }}>About This Tracker</h2>
      <p style={{ color: "#888", fontSize: "14px", fontFamily: "var(--m)", marginBottom: "16px" }}>Methodology, framework, and the humans behind the data.</p>

      <Section id="method" title="METHODOLOGY">
        <p>This tracker uses a two-layer architecture that separates facts from analysis — a deliberate design choice to eliminate the hallucinations that plagued earlier AI-only approaches.</p>
        <p><strong style={{ color: "#fff" }}>Layer 1 — Facts (zero AI):</strong> All bill metadata — author, party, district, status, vote history, legislative lifecycle dates — is sourced directly from the <a href="https://legiscan.com" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>LegiScan API</a>, which mirrors the California Legislature's official records in near real-time. AI never touches these fields. This was a direct response to early prototype failures: AI generated wrong district numbers, fabricated dates, and misattributed bill sponsors.</p>
        <p><strong style={{ color: "#fff" }}>Layer 2 — Analysis (AI-assisted, human-reviewed):</strong> Each bill's equity classification, rationale, and affected populations are generated by Claude (Anthropic). The AI reads the official bill title and legislative description and produces a draft equity assessment. Each assessment should be read critically — AI can miss political context, legislative history, and community-level nuance that isn't in the bill text.</p>
        <p>The full dataset covers <strong style={{ color: "#F9A825" }}>all 4,863 bills</strong> introduced in California's 2025-2026 legislative session (both years), 100% classified as of April 2026.</p>
        <p style={{ marginTop: "8px", color: "#666", fontSize: "12px" }}>Policy area tags are inferred by keyword matching on bill titles and descriptions, since LegiScan's subject-tagging for this session is incomplete. A bill can appear under multiple policy areas.</p>
      </Section>

      <Section id="framework" title="EQUITY FRAMEWORK">
        <p style={{ marginBottom: "8px" }}>Bills are classified on two axes:</p>
        <p><strong style={{ color: "#D50000" }}>Proximity</strong> measures how directly a bill engages with race:</p>
        <p style={{ marginLeft: "12px" }}><strong style={{ color: "#fff" }}>Explicit</strong> = Names race, ethnicity, or specific racial groups directly in the bill text or targets clearly racialized conditions.</p>
        <p style={{ marginLeft: "12px" }}><strong style={{ color: "#E65100" }}>Structural</strong> = Does not name race but shapes institutions, systems, or conditions that disproportionately affect communities of color.</p>
        <p style={{ marginTop: "10px" }}><strong style={{ color: "#00C853" }}>Direction</strong> measures the bill's impact on racial equity:</p>
        <p style={{ marginLeft: "12px" }}><strong style={{ color: "#00C853" }}>Advances</strong> = Moves toward reducing racial disparities or increasing protections for communities of color.</p>
        <p style={{ marginLeft: "12px" }}><strong style={{ color: "#FF1744" }}>Threatens</strong> = Could widen racial disparities or weaken protections for communities of color.</p>
        <p style={{ marginLeft: "12px" }}><strong style={{ color: "#F9A825" }}>Mixed</strong> = Contains provisions that both advance and threaten equity, or has genuinely ambiguous impacts.</p>
        <p style={{ marginTop: "10px" }}>These classifications evaluate <strong style={{ color: "#fff" }}>what a bill does</strong>, not who authored it. Bills by Democrats can threaten equity, and bills by Republicans can advance it. The framework is about impact on communities of color, not partisan scorekeeping.</p>
      </Section>

      <Section id="data" title="DATA SOURCES">
        <p><strong style={{ color: "#fff" }}>Bill metadata</strong> (author, party, status, dates, lifecycle, votes): <a href="https://legiscan.com" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>LegiScan API</a>, which mirrors <a href="https://leginfo.legislature.ca.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>leginfo.legislature.ca.gov</a> — the official California Legislative Information portal.</p>
        <p><strong style={{ color: "#fff" }}>Equity classifications</strong>: AI-generated (Claude Sonnet, Anthropic), using official bill titles and legislative descriptions as input. Classifications cover all 4,863 bills in the 2025-2026 session.</p>
        <p><strong style={{ color: "#fff" }}>Process statistics and context</strong>: <a href="https://calmatters.org" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>CalMatters</a>, <a href="https://capitolweekly.net" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>Capitol Weekly</a>, <a href="https://calbudgetcenter.org" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>California Budget & Policy Center</a></p>
        <p style={{ marginTop: "8px", color: "#666", fontSize: "12px" }}>This tool is not affiliated with the State of California. Data is updated monthly aligned with the legislative calendar.</p>
      </Section>

      <Section id="energy" title="ENERGY & AI ACCOUNTABILITY">
        <p>AI tools consume real energy, use real water for cooling, and produce real carbon emissions. Data centers powering AI disproportionately affect communities of color, who are more likely to live near these facilities and bear the environmental burden of increased electricity demand and water use. A single AI query uses roughly 3 to 10 times more energy than a traditional web search.</p>
        <p>As researchers committed to racial equity, we take this seriously. We have made a deliberate commitment to cap the total AI energy this project uses annually and to report that usage transparently.</p>
        <p style={{ marginTop: "10px" }}><strong style={{ color: "#fff" }}>Our energy cap: 17 kWh per year.</strong></p>
        <p>That is the energy equivalent of driving from UCLA to Los Angeles City Hall once: 13 miles, about half a gallon of gas. The symbolism is intentional: this tool is built by a researcher at UCLA thinking about policy that shapes the city. We believe the tradeoff is worth it for public transparency, but we commit to keeping the footprint small.</p>
        <p style={{ marginTop: "10px" }}><strong style={{ color: "#F9A825" }}>How the energy budget breaks down:</strong></p>
        <p>Building and prototyping the tracker used approximately <strong style={{ color: "#fff" }}>2.25 kWh</strong>. Classifying all 4,863 bills in the full 2025-2026 session used approximately <strong style={{ color: "#fff" }}>2.33 kWh</strong> (2.33 million tokens at roughly 1 kWh per million tokens). Total so far: <strong style={{ color: "#fff" }}>~4.6 kWh — 27% of our annual cap</strong>. The remaining 12.4 kWh covers monthly status updates through the end of the session. Each monthly update checks for status changes and reclassifies amended bills, using roughly 0.5 to 1 kWh per update.</p>
        <p>The tracker itself uses zero ongoing AI energy. It is a static application that runs entirely in your browser. No server, no database, no API calls when you use it. Classifications are generated in batches and published as static data.</p>
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: "2px", height: "20px", marginTop: "8px", overflow: "hidden", position: "relative" }}>
          <div style={{ background: `linear-gradient(90deg, #D50000, #FF6D00)`, width: `${pct}%`, height: "100%", transition: "width 0.5s" }} />
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "var(--m)", fontSize: "9px", color: "#fff", fontWeight: 700 }}>{energyUsed} / {energyCap} kWh ({pct}%)</span>
        </div>
        <p style={{ fontSize: "11px", color: "#555", marginTop: "6px" }}>Last updated: April 2026 · Total tokens used: 2,326,750 · Model: Claude Sonnet (Anthropic)</p>
      </Section>

      <Section id="built" title="BUILT BY">
        <p><strong style={{ color: "#fff" }}>Dr. Jasmine D. Hill</strong>, Assistant Professor of Public Policy and Sociology at <a href="https://luskin.ucla.edu" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>UCLA Luskin School of Public Affairs</a>. Ph.D. in Sociology, Stanford University.</p>
        <p style={{ marginTop: "6px" }}>Jasmine is a sociologist whose scholarship focuses on racial inequality and social mobility for Black Americans. Her work explores how public institutions shape workforce development and the mechanisms that lift communities of color out of poverty. Her research has been published in Social Problems, Teaching Sociology, and The Journal of Cultural Economy. She co-edited Inequality in the 21st Century (Westview Press, 2017) and co-created PledgeLA with the Annenberg Foundation and the Office of the Los Angeles Mayor to measure and increase equity in LA's tech industry. Her work has been featured in TIME Magazine, The Los Angeles Times, and Cheddar News.</p>
        <p style={{ marginTop: "8px" }}>More at <a href="https://jasmine-hill.com" target="_blank" rel="noopener noreferrer" style={{ color: "#D50000" }}>jasmine-hill.com</a></p>
        <p style={{ marginTop: "10px" }}>Questions, corrections, or ideas? <a href="mailto:jhill@luskin.ucla.edu?subject=CA%20Equity%20Legislative%20Tracker%20-%20Feedback" style={{ color: "#D50000", fontWeight: 700 }}>Email the project</a></p>
        <p style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>Subject line pre-filled for easy filtering. You can also suggest bills for inclusion.</p>
      </Section>

      <Section id="roadmap" title="ROADMAP">
        <p style={{ marginBottom: "10px" }}>Here is what we have built and what is coming next.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            ["Full 4,863-bill dataset", "All bills introduced in California's 2025-2026 session — both years — with equity classifications for every single bill. 100% classified as of April 2026.", "Done"],
            ["LegiScan data pipeline", "Automated pipeline separating facts (LegiScan API: authors, status, dates, votes — zero AI) from analysis (Claude: equity classification). Eliminates hallucinations from earlier prototype.", "Done"],
            ["2026 bill tracking", "All 2026 bills introduced after the February 20, 2026 deadline are now in the tracker, with equity classifications.", "Done"],
            ["Monthly status updates", "Refresh bill statuses, add new votes and Governor actions as the 2026 session progresses through September. Target cadence: monthly, aligned with the legislative calendar.", "In progress"],
            ["Bill detail deep-dives", "Expand individual bill view to include full vote breakdowns by legislator, amendment history, and committee testimony links.", "Planned"],
            ["District map", "Interactive map of California showing legislative activity by district. Look up your representative and see their full equity record.", "Planned"],
            ["Export and share", "Download filtered bill lists as CSV for class assignments, share watchlists via URL.", "Planned"],
            ["Budget equity tracker", "Dedicated view for the state budget: track how dollars flow to communities by race, region, and income level across the $300B+ California budget.", "Exploring"],
            ["Community tagging", "Allow users to suggest equity tags and flag analyses for review, with submissions going to a moderated queue.", "Exploring"],
          ].map(([title, desc, status]) => (
            <div key={title} style={{ background: "#111", border: `1px solid ${status === "Done" ? "#1a2a1a" : "#1e1e1e"}`, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontFamily: "var(--m)", fontSize: "11px", color: status === "Done" ? "#888" : "#fff", fontWeight: 700 }}>{status === "Done" && "✓ "}{title}</span>
                <span style={{ fontFamily: "var(--m)", fontSize: "8px", color: status === "Done" ? "#2e7d32" : status === "In progress" ? "#00E676" : status === "Planned" ? "#F9A825" : "#666", fontWeight: 700, letterSpacing: "0.5px" }}>{status.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: "11px", color: status === "Done" ? "#555" : "#888", fontFamily: "var(--b)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: "12px", fontSize: "12px" }}>Have a feature idea? <a href="mailto:jhill@luskin.ucla.edu?subject=CA%20Equity%20Leg%20Tracker%20-%20Feature%20Suggestion" style={{ color: "#D50000", fontWeight: 700 }}>Suggest a feature</a></p>
      </Section>
    </div>
  );
}



// ============================================================
// ADMIN MODE - Inline editing for About, Sac 101, and Bills
// ============================================================

const ADMIN_KEY = "eq_tracker_admin";
const EDITS_KEY = "eq_tracker_edits";

// Safe storage wrappers
const _store = {};
function safeGet(storage, key) { try { return storage.getItem(key); } catch { return _store[key] || null; } }
function safeSet(storage, key, val) { try { storage.setItem(key, val); } catch { _store[key] = val; } }
function safeRemove(storage, key) { try { storage.removeItem(key); } catch { delete _store[key]; } }

function loadEdits() {
  try { return JSON.parse(safeGet(localStorage, EDITS_KEY) || "{}"); } catch { return {}; }
}
function saveEdits(edits) {
  safeSet(localStorage, EDITS_KEY, JSON.stringify(edits));
}

// Hook: call ONCE in App, pass `admin` as prop everywhere else
function useAdmin() {
  const [admin, setAdmin] = useState(() => safeGet(sessionStorage, ADMIN_KEY) === "1");
  const toggle = useCallback((pw) => {
    if (admin) { safeRemove(sessionStorage, ADMIN_KEY); setAdmin(false); return true; }
    if (pw === "equity2025") { safeSet(sessionStorage, ADMIN_KEY, "1"); setAdmin(true); return true; }
    return false;
  }, [admin]);
  return [admin, toggle];
}

// ---- Editable text (inline contentEditable) ----
function Editable({ admin, id, children, style, multiline }) {
  const [editing, setEditing] = useState(false);
  const [ver, setVer] = useState(0);
  const ref = useRef(null);

  // NOT admin mode: pure pass-through, no storage lookup at all
  if (!admin) return children || null;

  const edits = loadEdits();
  const saved = edits[id];
  const handleBlur = () => {
    setEditing(false);
    if (ref.current) {
      const ne = loadEdits(); ne[id] = ref.current.innerHTML; saveEdits(ne); setVer(v => v + 1);
    }
  };
  const content = saved !== undefined ? saved : (typeof children === "string" ? children : "");
  const Tag = multiline ? "div" : "span";
  return (
    <Tag ref={ref} contentEditable suppressContentEditableWarning
      onFocus={() => setEditing(true)} onBlur={handleBlur}
      style={{ ...style, outline: editing ? "2px solid #D50000" : "1px dashed rgba(213,0,0,0.3)", outlineOffset: "2px", cursor: "text", minHeight: multiline ? "20px" : undefined, padding: "2px" }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// ---- Editable select (dropdown) ----
function EditableSelect({ admin, id, value, options, style }) {
  const [ver, setVer] = useState(0);
  const edits = loadEdits();
  const saved = edits[id];
  const current = saved !== undefined ? saved : value;
  if (!admin) return null;
  return (
    <select value={current} onChange={(e) => { const ne = loadEdits(); ne[id] = e.target.value; saveEdits(ne); setVer(v => v + 1); }}
      style={{ background: "#1a1a1a", color: "#fff", border: "1px dashed rgba(213,0,0,0.3)", fontSize: "10px", fontFamily: "var(--m)", padding: "2px 4px", cursor: "pointer", ...style }}>
      {Object.entries(options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
    </select>
  );
}

// ---- Tag editor (click to toggle) ----
function EditableTags({ admin, id, tags, allTags, colorFn, label }) {
  const [ver, setVer] = useState(0);
  const edits = loadEdits();
  const saved = edits[id];
  let current;
  try { current = saved ? JSON.parse(saved) : tags; } catch { current = tags; }
  if (!admin) return null;

  const toggle = (tag) => {
    const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    const ne = loadEdits(); ne[id] = JSON.stringify(next); saveEdits(ne); setVer(v => v + 1);
  };

  return (
    <div style={{ marginBottom: "8px" }}>
      {label && <div style={{ fontSize: "8px", fontWeight: 700, color: "#555", fontFamily: "var(--m)", marginBottom: "4px", letterSpacing: "1px" }}>{label}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
        {allTags.map(t => (
          <button key={t} onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggle(t); }}
            style={{
              background: current.includes(t) ? (colorFn ? colorFn(t) : "#D50000") : "#1a1a1a",
              color: current.includes(t) ? "#fff" : "#555",
              border: "1px solid " + (current.includes(t) ? "transparent" : "#333"),
              fontSize: "9px", fontFamily: "var(--m)", padding: "2px 6px", cursor: "pointer",
              opacity: current.includes(t) ? 1 : 0.6,
            }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// ---- Admin Toolbar (floating) ----
function AdminToolbar({ admin, onToggle }) {
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  const handleExport = () => {
    const edits = loadEdits();
    const blob = new Blob([JSON.stringify(edits, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "tracker_edits.json"; a.click(); URL.revokeObjectURL(url);
  };
  const handleReset = () => {
    const doIt = typeof window.confirm === "function" ? window.confirm("Clear ALL saved edits?") : true;
    if (doIt) { safeRemove(localStorage, EDITS_KEY); window.location.reload(); }
  };
  const editCount = Object.keys(loadEdits()).length;

  if (admin) {
    return (
      <div style={{ position: "fixed", bottom: "12px", right: "12px", zIndex: 9999, background: "#1a0000", border: "1px solid #D50000", padding: "8px 12px", display: "flex", gap: "8px", alignItems: "center", boxShadow: "0 4px 20px rgba(213,0,0,0.3)" }}>
        <span style={{ fontFamily: "var(--m)", fontSize: "9px", color: "#D50000", fontWeight: 700, letterSpacing: "1px" }}>
          {"\u270F\uFE0F"} EDIT MODE {editCount > 0 && `(${editCount} edits)`}
        </span>
        <button onClick={handleExport} style={{ background: "#222", color: "#aaa", border: "1px solid #333", fontSize: "9px", fontFamily: "var(--m)", padding: "3px 8px", cursor: "pointer" }}>Export JSON</button>
        <button onClick={handleReset} style={{ background: "#222", color: "#666", border: "1px solid #333", fontSize: "9px", fontFamily: "var(--m)", padding: "3px 8px", cursor: "pointer" }}>Reset</button>
        <button onClick={() => onToggle()} style={{ background: "#D50000", color: "#fff", border: "none", fontSize: "9px", fontFamily: "var(--m)", padding: "3px 8px", cursor: "pointer", fontWeight: 700 }}>Exit</button>
      </div>
    );
  }

  return showPw ? (
    <div style={{ position: "fixed", bottom: "12px", right: "12px", zIndex: 9999, background: "#111", border: "1px solid #333", padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
      <div style={{ fontFamily: "var(--m)", fontSize: "9px", color: "#666", marginBottom: "6px" }}>Admin password:</div>
      <div style={{ display: "flex", gap: "4px" }}>
        <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => { if (e.key === "Enter") { if (!onToggle(pw)) setErr(true); else { setShowPw(false); setPw(""); } } }}
          style={{ background: "#0a0a0a", border: `1px solid ${err ? "#D50000" : "#333"}`, color: "#fff", fontSize: "11px", fontFamily: "var(--m)", padding: "4px 8px", width: "120px" }} autoFocus />
        <button onClick={() => { if (!onToggle(pw)) setErr(true); else { setShowPw(false); setPw(""); } }}
          style={{ background: "#D50000", color: "#fff", border: "none", fontSize: "9px", fontFamily: "var(--m)", padding: "4px 8px", cursor: "pointer" }}>Go</button>
        <button onClick={() => { setShowPw(false); setPw(""); }}
          style={{ background: "#222", color: "#666", border: "1px solid #333", fontSize: "9px", fontFamily: "var(--m)", padding: "4px 8px", cursor: "pointer" }}>{"\u2715"}</button>
      </div>
      {err && <div style={{ fontFamily: "var(--m)", fontSize: "9px", color: "#D50000", marginTop: "4px" }}>Wrong password</div>}
    </div>
  ) : (
    <button onClick={() => setShowPw(true)}
      style={{ position: "fixed", bottom: "4px", right: "4px", zIndex: 9999, background: "transparent", border: "none", color: "#1a1a1a", fontSize: "8px", cursor: "pointer", opacity: 0.3, fontFamily: "var(--m)" }}
      title="Admin">{"\u2699\uFE0F"}</button>
  );
}

// ---- Rich text mini-toolbar ----
function MiniToolbar({ admin }) {
  if (!admin) return null;
  const cmd = (c, v) => { document.execCommand(c, false, v); };
  const colors = ["#D50000", "#F9A825", "#00E676", "#42A5F5", "#fff", "#888"];
  return (
    <div style={{ position: "fixed", bottom: "50px", right: "12px", zIndex: 9999, background: "#111", border: "1px solid #333", padding: "4px 6px", display: "flex", gap: "2px", alignItems: "center" }}>
      <button onClick={() => cmd("bold")} style={{ background: "none", border: "none", color: "#fff", fontSize: "12px", cursor: "pointer", fontWeight: 700, padding: "2px 6px" }}>B</button>
      <button onClick={() => cmd("italic")} style={{ background: "none", border: "none", color: "#fff", fontSize: "12px", cursor: "pointer", fontStyle: "italic", padding: "2px 6px" }}>I</button>
      <span style={{ width: "1px", height: "14px", background: "#333" }} />
      {colors.map(c => (
        <button key={c} onClick={() => cmd("foreColor", c)} style={{ width: "14px", height: "14px", background: c, border: "1px solid #444", cursor: "pointer", padding: 0 }} />
      ))}
      <span style={{ width: "1px", height: "14px", background: "#333" }} />
      {["\u{1F525}", "\u2705", "\u26A0\uFE0F", "\u{1F4A1}", "\u{1F3DB}\uFE0F", "\u2696\uFE0F"].map(e => (
        <button key={e} onClick={() => cmd("insertText", e)} style={{ background: "none", border: "none", fontSize: "12px", cursor: "pointer", padding: "1px 3px" }}>{e}</button>
      ))}
    </div>
  );
}


// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [admin, toggleAdmin] = useAdmin();
  const [bills, setBills] = useState(BILLS_DATA);
  const [loadingData, setLoadingData] = useState(true);
  const [view, setView] = useState("bills"); // bills | sac101 | about
  const [year, setYear] = useState(2026);

  useEffect(() => {
    fetch("/ca_equity_bills_2025.json")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        if (data.bills?.length) setBills(data.bills.map(normalizeBill));
      })
      .catch(() => {/* fall back to sample data */})
      .finally(() => setLoadingData(false));
  }, []);

  const ALL_AUTHORS = useMemo(() => [...new Set(bills.map(b => b.author))].sort(), [bills]);
  const [search, setSearch] = useState("");
  const [chamber, setChamber] = useState("all");
  const [partyF, setPartyF] = useState("all");
  const [raceF, setRaceF] = useState([]);
  const [genderF, setGenderF] = useState(false);
  const [lgbtqF, setLgbtqF] = useState(false);
  const [disabilityF, setDisabilityF] = useState(false);
  const [workingF, setWorkingF] = useState(false);
  const [proximityF, setProximityF] = useState([]);
  const [directionF, setDirectionF] = useState([]);
  const [topicF, setTopicF] = useState([]);
  const [statusF, setStatusF] = useState([]);
  const [authorF, setAuthorF] = useState([]);
  const [modalBill, setModalBill] = useState(null);
  const [sortBy, setSortBy] = useState("number");
  const [sortDir, setSortDir] = useState("asc");
  const [starredIds, setStarredIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("eq_starred") || "[]"); } catch { return []; }
  });
  const [showStarred, setShowStarred] = useState(false);
  const [starTooltip, setStarTooltip] = useState(() => !localStorage.getItem("eq_star_seen"));

  useEffect(() => {
    try { localStorage.setItem("eq_starred", JSON.stringify(starredIds)); } catch {}
  }, [starredIds]);

  const toggleStar = (id) => {
    setStarredIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    if (starTooltip) { setStarTooltip(false); try { localStorage.setItem("eq_star_seen", "1"); } catch {} }
  };

  const tog = (a, s, v) => s(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const intActive = k => ({ "Gender": genderF, "LGBTQ+": lgbtqF, "Disability": disabilityF, "Working-class": workingF }[k]);
  const togInt = k => ({ "Gender": () => setGenderF(p => !p), "LGBTQ+": () => setLgbtqF(p => !p), "Disability": () => setDisabilityF(p => !p), "Working-class": () => setWorkingF(p => !p) }[k])();

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("asc"); }
  };

  // Every filter except status — used to drive the per-status stat counts, so those
  // counts react to race/chamber/search/etc. filters without collapsing to 0 once a
  // status is already selected.
  const filteredBase = useMemo(() => {
    let b = bills.filter(x => x.year === year);
    if (search) { const q = search.toLowerCase(); b = b.filter(x => x.title.toLowerCase().includes(q) || x.summary.toLowerCase().includes(q) || x.author.toLowerCase().includes(q) || x.number.toLowerCase().includes(q) || x.equityRationale.toLowerCase().includes(q)); }
    if (chamber !== "all") b = b.filter(x => x.chamber.toLowerCase() === chamber);
    if (partyF !== "all") b = b.filter(x => x.authorParty === partyF);
    if (raceF.length) b = b.filter(x => raceF.some(f => x.race.includes(f)));
    if (genderF) b = b.filter(x => x.gender);
    if (lgbtqF) b = b.filter(x => x.lgbtq);
    if (disabilityF) b = b.filter(x => x.disability);
    if (workingF) b = b.filter(x => x.workingClass);
    if (proximityF.length) b = b.filter(x => proximityF.includes(x.equityProximity));
    if (directionF.length) b = b.filter(x => directionF.includes(x.equityDirection));
    if (topicF.length) b = b.filter(x => x.topics.some(t => topicF.includes(t)));
    if (authorF.length) b = b.filter(x => authorF.includes(x.author));
    if (showStarred) b = b.filter(x => starredIds.includes(x.id));
    return b;
  }, [bills, year, search, chamber, partyF, raceF, genderF, lgbtqF, disabilityF, workingF, proximityF, directionF, topicF, authorF, showStarred, starredIds]);

  const filtered = useMemo(() => {
    let b = statusF.length ? filteredBase.filter(x => statusF.includes(x.status)) : filteredBase;

    const dir = sortDir === "asc" ? 1 : -1;
    b = [...b];
    if (sortBy === "number") b.sort((a, c) => dir * a.number.localeCompare(c.number, undefined, { numeric: true }));
    else if (sortBy === "name") b.sort((a, c) => dir * a.title.localeCompare(c.title));
    return b;
  }, [filteredBase, statusF, sortBy, sortDir]);

  const clearAll = () => { setSearch(""); setChamber("all"); setPartyF("all"); setRaceF([]); setGenderF(false); setLgbtqF(false); setDisabilityF(false); setWorkingF(false); setProximityF([]); setDirectionF([]); setTopicF([]); setStatusF([]); setAuthorF([]); setShowStarred(false); };
  const anyF = search || chamber !== "all" || partyF !== "all" || raceF.length || genderF || lgbtqF || disabilityF || workingF || proximityF.length || directionF.length || topicF.length || statusF.length || authorF.length || showStarred;

  const statFilter = (status) => {
    if (statusF.length === 1 && statusF[0] === status) setStatusF([]);
    else setStatusF([status]);
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#fff", "--m": "'Space Mono', monospace", "--s": "'Playfair Display', Georgia, serif", "--b": "'Charter', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #D50000; color: #fff; }
        input::placeholder { color: #3a3a3a; }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>

      <header style={{ background: "#080808", borderBottom: "3px solid #D50000", padding: "14px 18px" }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ fontFamily: "var(--m)", fontSize: "8px", color: "#D50000", letterSpacing: "3px", fontWeight: 700 }}>CALIFORNIA</div>
            <h1 style={{ fontFamily: "var(--s)", fontSize: "26px", fontWeight: 900, lineHeight: 1, color: "#fff", cursor: "pointer" }} onClick={() => setView("bills")}>Equity Legislative Tracker</h1>
            <div style={{ fontFamily: "var(--m)", fontSize: "9px", color: "#444", marginTop: "2px" }}>For students & advocates tracking racial equity in CA policy</div>
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {[2025, 2026].map(y => <button key={y} onClick={() => { setYear(y); setView("bills"); }} style={{ background: year === y && view === "bills" ? "#D50000" : "#0e0e0e", color: year === y && view === "bills" ? "#fff" : "#444", border: "1px solid #1e1e1e", padding: "4px 12px", fontFamily: "var(--m)", fontWeight: 700, fontSize: "11px", cursor: "pointer" }}>{y}</button>)}
            <button onClick={() => setView(view === "sac101" ? "bills" : "sac101")} style={{ background: view === "sac101" ? "#D50000" : "#0e0e0e", color: view === "sac101" ? "#fff" : "#D50000", border: "1px solid #D50000", padding: "4px 10px", fontFamily: "var(--m)", fontWeight: 700, fontSize: "9px", cursor: "pointer" }}>
              {view === "sac101" ? "\u2190 BILLS" : "\u{1F4DC} SAC 101"}
            </button>
            <button onClick={() => setView(view === "about" ? "bills" : "about")} style={{ background: view === "about" ? "#D50000" : "#0e0e0e", color: view === "about" ? "#fff" : "#D50000", border: "1px solid #D50000", padding: "4px 10px", fontFamily: "var(--m)", fontWeight: 700, fontSize: "9px", cursor: "pointer" }}>
              {view === "about" ? "\u2190 BILLS" : "\u2139\uFE0F ABOUT"}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1060px", margin: "0 auto", padding: "14px 18px" }}>
        {view === "sac101" ? <Sacramento101 admin={admin} /> :
         view === "about" ? <AboutPage admin={admin} /> :
          false ? null : (
            <>
              <input type="text" placeholder="Search by keyword, author, bill #..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: "#0c0c0c", border: "1px solid #1e1e1e", color: "#fff", fontSize: "14px", fontFamily: "var(--m)", outline: "none", marginBottom: "10px" }} />

              <div style={{ background: "#0a0a0a", border: "1px solid #151515", padding: "12px", marginBottom: "10px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ fontFamily: "var(--m)", fontSize: "11px", color: "#666", letterSpacing: "1px", fontWeight: 700, marginBottom: "6px" }}>CHAMBER & PARTY</div>
                  <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", alignItems: "center" }}>
                    {[["all", "All"], ["assembly", "Assembly"], ["senate", "Senate"]].map(([v, l]) => <FilterBtn key={v} label={l} active={chamber === v} onClick={() => setChamber(v)} />)}
                    <span style={{ width: "1px", height: "20px", background: "#2a2a2a", margin: "0 4px" }} />
                    {[["all", "All Parties"], ["D", "Democrat"], ["R", "Republican"]].map(([v, l]) => <FilterBtn key={v} label={l} active={partyF === v} onClick={() => setPartyF(v)} color={v === "D" ? "#1565C0" : v === "R" ? "#C62828" : undefined} />)}
                  </div>
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <div style={{ fontFamily: "var(--m)", fontSize: "11px", color: "#666", letterSpacing: "1px", fontWeight: 700, marginBottom: "6px" }}>IDENTITY</div>
                  <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", alignItems: "center" }}>
                    {RACE_TAGS.map(t => <FilterBtn key={t} label={t} active={raceF.includes(t)} onClick={() => tog(raceF, setRaceF, t)} color={COLORS[t]} />)}
                    <span style={{ width: "1px", height: "20px", background: "#2a2a2a", margin: "0 3px" }} />
                    {INTERSECTIONAL.map(t => <FilterBtn key={t} label={t} active={intActive(t)} onClick={() => togInt(t)} color={COLORS[t]} />)}
                  </div>
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <div style={{ fontFamily: "var(--m)", fontSize: "11px", color: "#666", letterSpacing: "1px", fontWeight: 700, marginBottom: "6px" }}>EQUITY LENS</div>
                  <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", alignItems: "center" }}>
                    {Object.entries(EQUITY_PROXIMITY).map(([k, v]) => <FilterBtn key={k} label={v} active={proximityF.includes(k)} onClick={() => tog(proximityF, setProximityF, k)} color={COLORS[k]} />)}
                    <span style={{ width: "1px", height: "20px", background: "#2a2a2a", margin: "0 3px" }} />
                    {Object.entries(EQUITY_DIRECTION).map(([k, v]) => <FilterBtn key={k} label={v} active={directionF.includes(k)} onClick={() => tog(directionF, setDirectionF, k)} color={COLORS[k]} />)}
                  </div>
                </div>

                <div style={{ marginBottom: "8px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: "var(--m)", fontSize: "11px", color: "#666", letterSpacing: "1px", fontWeight: 700, marginBottom: "6px" }}>POLICY AREA</div>
                    <DropdownMulti label="Policy Areas" selected={topicF} onChange={setTopicF} options={ALL_TOPICS} year={year} countFn={t => bills.filter(b => b.topics.includes(t) && b.year === year).length} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--m)", fontSize: "11px", color: "#666", letterSpacing: "1px", fontWeight: 700, marginBottom: "6px" }}>SPONSOR</div>
                    <DropdownMulti label="Bill Sponsor" selected={authorF} onChange={setAuthorF} options={ALL_AUTHORS} year={year} countFn={a => bills.filter(b => b.author === a && b.year === year).length} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", borderTop: "1px solid #151515", paddingTop: "8px", flexWrap: "wrap", gap: "4px" }}>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--m)", fontSize: "11px", color: "#666", letterSpacing: "1px", fontWeight: 700 }}>SORT:</span>
                    <FilterBtn label={`Bill # ${sortBy === "number" ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}`} active={sortBy === "number"} onClick={() => toggleSort("number")} />
                    <FilterBtn label={`Name ${sortBy === "name" ? (sortDir === "asc" ? "A-Z" : "Z-A") : ""}`} active={sortBy === "name"} onClick={() => toggleSort("name")} />
                    <span style={{ width: "1px", height: "20px", background: "#2a2a2a", margin: "0 4px" }} />
                    <div style={{ position: "relative" }}>
                      <FilterBtn label={`\u2605 Starred${starredIds.length ? ` (${starredIds.length})` : ""}`} active={showStarred} onClick={() => setShowStarred(p => !p)} color="#F9A825" />
                      {starTooltip && starredIds.length === 0 && (
                        <div style={{ position: "absolute", top: "-36px", left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", border: "1px solid #F9A825", padding: "4px 10px", borderRadius: "3px", fontSize: "12px", color: "#F9A825", fontFamily: "var(--m)", whiteSpace: "nowrap", zIndex: 60, pointerEvents: "none" }}>
                          Star bills to build your watchlist
                          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #F9A825" }} />
                        </div>
                      )}
                    </div>
                  </div>
                  {anyF && <button onClick={clearAll} style={{ background: "transparent", color: "#D50000", border: "1px solid #D5000055", padding: "4px 10px", fontFamily: "var(--m)", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>CLEAR ALL</button>}
                </div>
              </div>

              {/* STATUS TILES - clickable filter row (replaces status filter buttons) */}
              <div style={{ display: "flex", gap: "1px", marginBottom: "10px" }}>
                {[
                  { l: "SHOWING", sub: "all bills", status: null, c: "#fff" },
                  { l: "SIGNED", sub: "into law", status: "Signed into Law", c: "#00E676" },
                  { l: "PASSED", sub: "legislature", status: "Passed Legislature", c: "#66BB6A" },
                  { l: "SENT TO", sub: "voters", status: "Referred to Ballot", c: "#F9A825" },
                  { l: "FAILED", sub: "in committee", status: "Failed in Committee", c: "#FF6D00" },
                  { l: "VETOED", sub: "by governor", status: "Vetoed", c: "#FF1744" },
                ].map(s => {
                  const count = s.status ? filteredBase.filter(b => b.status === s.status).length : filtered.length;
                  const isActive = s.status && statusF.length === 1 && statusF[0] === s.status;
                  return (
                    <div key={s.l} onClick={s.status ? () => statFilter(s.status) : undefined} style={{
                      background: isActive ? `${s.c}15` : "#0c0c0c",
                      border: isActive ? `1px solid ${s.c}44` : "1px solid #181818",
                      padding: "9px 4px", flex: 1, textAlign: "center",
                      cursor: s.status ? "pointer" : "default", transition: "all 0.12s",
                    }}
                      onMouseEnter={e => { if (s.status) e.currentTarget.style.background = isActive ? `${s.c}20` : "#151515"; }}
                      onMouseLeave={e => { if (s.status) e.currentTarget.style.background = isActive ? `${s.c}15` : "#0c0c0c"; }}>
                      <div style={{ fontFamily: "var(--m)", fontSize: "20px", fontWeight: 700, color: s.status === null ? "#fff" : (isActive ? s.c : `${s.c}88`) }}>{s.status === null ? filtered.length : count}</div>
                      <div style={{ fontFamily: "var(--m)", fontSize: "10px", color: isActive ? s.c : "#666", letterSpacing: "0.5px", fontWeight: isActive ? 700 : 400, lineHeight: 1.3 }}>{s.l}<br/><span style={{ fontSize: "9px", letterSpacing: "0.3px" }}>{s.sub}</span></div>
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#444" }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{"\uD83D\uDD0D"}</div>
                  <div style={{ fontFamily: "var(--m)", fontSize: "12px" }}>No bills match{showStarred ? " (try clearing the Starred filter)" : ""}</div>
                </div>
              ) : filtered.map(bill => (
                <BillListItem
                  key={bill.id}
                  bill={bill}
                  onOpen={() => setModalBill(bill)}
                  starred={starredIds.includes(bill.id)}
                  onStar={toggleStar}
                />
              ))}

              <div style={{ marginTop: "16px", padding: "12px", borderTop: "1px solid #151515", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--m)", fontSize: "11px", color: "#444", letterSpacing: "0.5px", lineHeight: 1.8 }}>
                  {"\u26A0\uFE0F"} EQUITY CLASSIFICATIONS ARE AI-ASSESSED {"\u00B7"} DESIGNED TO BE CRITICALLY EXAMINED<br />
                  Bill metadata: leginfo.legislature.ca.gov {"\u00B7"} Not affiliated with State of California<br />
                  Authors verified Feb 2026 {"\u00B7"} Built for students & advocates
                </div>
              </div>
            </>
          )}
      </main>

      {modalBill && (
        <BillModal
          bill={modalBill}
          onClose={() => setModalBill(null)}
          starred={starredIds.includes(modalBill.id)}
          onStar={toggleStar}
          admin={admin}
        />
      )}
      <AdminToolbar admin={admin} onToggle={toggleAdmin} />
      {admin && <MiniToolbar />}
    </div>
  );
}
