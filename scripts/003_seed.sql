-- ============================================================
-- SPARTANZ 3.0 — 003 SEED
-- Run AFTER 001_schema.sql and 002_rls.sql. Safe to re-run.
--
-- ORGANISERS: replace the admin email below with your own before running.
-- ============================================================

-- ------------------------------------------------------------
-- 1. ADMIN ALLOW LIST  <-- EDIT THIS
-- ------------------------------------------------------------
insert into public.admin_emails (email, note) values
  ('REPLACE_ME_admin@example.com', 'Primary symposium admin')
on conflict (email) do nothing;

-- Already signed in before adding yourself above? Promote manually:
-- update public.profiles set role = 'admin' where email = 'you@example.com';

-- ------------------------------------------------------------
-- 2. SITE SETTINGS  <-- EDIT DATES / VENUE / CONTACT
-- ------------------------------------------------------------
insert into public.site_settings (
  id, symposium_name, subtitle, college_name, department_name, club_name,
  event_date, venue, contact_email, contact_phone,
  instagram_url, linkedin_url, github_url, youtube_url,
  hero_headline, hero_subline, countdown_target, registration_open
) values (
  'default',
  'SPARTANZ 3.0',
  'Department Symposium',
  'New Prince Shri Bhavani College of Engineering',
  'CSE — Cyber Security',
  'RootSec Club',
  '2026-03-14',
  'Main Auditorium, New Prince Shri Bhavani College of Engineering',
  'spartanz@npsbcollege.edu.in',
  '+91 90000 00000',
  'https://instagram.com/',
  'https://linkedin.com/',
  'https://github.com/',
  'https://youtube.com/',
  'The end of one world is the beginning of another.',
  'A one-day cinematic symposium where cyber security students face the collapse — and rebuild what comes next.',
  '2026-03-14T09:00:00+05:30',
  true
)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 3. CATEGORIES
-- ------------------------------------------------------------
insert into public.event_categories (name, slug, description, display_order) values
  ('Technical', 'technical', 'Code, break, defend and present. Events that test engineering depth.', 1),
  ('Non-Technical', 'non-technical', 'Strategy, speed and chaos. Events built for the crowd.', 2)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 4. EVENTS
-- ------------------------------------------------------------
insert into public.events (
  name, slug, category_id, short_description, description, rules, image_url,
  event_date, start_time, end_time, venue, min_team_size, max_team_size,
  registration_fee, prizes, coordinator_name, coordinator_phone,
  status, featured, display_order
) values
(
  'Code Doomsday', 'code-doomsday',
  (select id from public.event_categories where slug = 'technical'),
  'Three rounds of competitive programming under a collapsing timer.',
  'Code Doomsday is the flagship algorithmic battle of SPARTANZ 3.0. Each round shortens the clock while the problems get heavier — survive elimination, optimise under pressure and finish the final set before the countdown reaches zero. Languages allowed: C, C++, Java, Python.',
  '["Individual participation only.","Three rounds: aptitude screening, timed coding, final optimisation round.","Any use of AI assistants, mobile phones or external repositories leads to disqualification.","Partial scoring applies; ties are broken by submission time.","Judges'' decision is final."]'::jsonb,
  '/events/code-doomsday.png',
  '2026-03-14', '09:30', '12:30', 'Programming Lab 1, CSE Block', 1, 1,
  150, 'Winner ₹5,000 · Runner-up ₹2,500 · Certificates for all finalists',
  'Aravind S', '+91 90000 00003', 'active', true, 1
),
(
  'Breach Protocol', 'breach-protocol',
  (select id from public.event_categories where slug = 'technical'),
  'A jeopardy-style capture the flag across web, crypto and reversing.',
  'Breach Protocol is RootSec Club''s signature CTF. Teams of two work through a live scoreboard of web exploitation, cryptography, steganography, OSINT and reverse engineering challenges. Flags unlock progressively — the final challenge only appears when half the field has cleared round two.',
  '["Teams of 2 participants.","Bring your own laptop; campus Wi-Fi and power will be provided.","Attacking the scoreboard or other teams'' machines means instant disqualification.","Flag sharing between teams is prohibited.","Scoreboard freezes 20 minutes before the end."]'::jsonb,
  '/events/breach-protocol.png',
  '2026-03-14', '10:00', '14:00', 'Cyber Security Lab, CSE Block', 2, 2,
  200, 'Winner ₹6,000 · Runner-up ₹3,000 · Best first-blood ₹1,000',
  'Nithya R', '+91 90000 00004', 'active', true, 2
),
(
  'Forensic Gauntlet', 'forensic-gauntlet',
  (select id from public.event_categories where slug = 'technical'),
  'Reconstruct a simulated breach from disk images, logs and packet captures.',
  'A compromised workstation, a suspicious PCAP and eleven minutes of missing logs. Teams perform disk and memory triage, build a timeline, identify the initial access vector and submit an incident report. Scoring rewards accuracy of the timeline over speed.',
  '["Teams of 2 to 3 participants.","Autopsy, Wireshark and Volatility will be pre-installed on lab machines.","The final incident report must be submitted in the provided template.","Evidence tampering scores zero for that artefact."]'::jsonb,
  '/events/forensic-gauntlet.png',
  '2026-03-14', '10:30', '13:30', 'Cyber Security Lab 2, CSE Block', 2, 3,
  200, 'Winner ₹4,000 · Runner-up ₹2,000 · Certificates for all finalists',
  'Harish M', '+91 90000 00005', 'active', false, 3
),
(
  'Paper Storm', 'paper-storm',
  (select id from public.event_categories where slug = 'technical'),
  'Technical paper presentation on security, AI and emerging systems.',
  'Present original work in eight minutes plus four minutes of questioning. Tracks include offensive security, privacy engineering, AI safety, secure hardware and post-quantum cryptography. Abstracts are screened before the symposium; shortlisted teams present on stage.',
  '["Teams of up to 2 presenters.","Abstract of 250 words must be submitted before 5 March 2026.","8 minutes presentation, 4 minutes Q&A. The bell is final.","Plagiarised submissions are rejected outright.","Slides must be submitted in PDF the previous evening."]'::jsonb,
  '/events/paper-storm.png',
  '2026-03-14', '09:30', '13:00', 'Seminar Hall, Main Block', 1, 2,
  150, 'Best paper ₹4,000 · Runner-up ₹2,000 · Publication support for top 3',
  'Prof. K. Divya', '+91 90000 00002', 'active', true, 4
),
(
  'Debug the Multiverse', 'debug-the-multiverse',
  (select id from public.event_categories where slug = 'technical'),
  'Broken code from parallel timelines. Fix it before the branch collapses.',
  'Each round hands you a codebase that almost works. Race to find the fault — off-by-one, race condition, memory leak or a subtly poisoned dependency — and patch it with the fewest lines changed. Minimal diffs score higher than clever rewrites.',
  '["Individual participation.","Rounds in C, Python and JavaScript.","Only the provided editor may be used. No internet access.","Scoring: correctness first, then diff size, then time."]'::jsonb,
  '/events/debug-multiverse.png',
  '2026-03-14', '13:30', '15:30', 'Programming Lab 2, CSE Block', 1, 1,
  100, 'Winner ₹3,000 · Runner-up ₹1,500',
  'Swetha P', '+91 90000 00006', 'active', false, 5
),
(
  'Web Siege', 'web-siege',
  (select id from public.event_categories where slug = 'technical'),
  'Build a resilient web app in four hours, then defend it from the room.',
  'A build-and-defend hackathon. Teams ship a small web application against a given brief in the first three hours. In the final hour, teams rotate and attempt to break each other''s app — points are scored both for surviving and for finding real vulnerabilities.',
  '["Teams of 3 to 4 participants.","Any stack allowed. Starter templates are permitted; pre-written project code is not.","Denial of service attacks during the defence round are not counted.","Every finding must be submitted with reproduction steps."]'::jsonb,
  '/events/web-siege.png',
  '2026-03-14', '09:30', '14:30', 'Innovation Lab, CSE Block', 3, 4,
  300, 'Winner ₹8,000 · Runner-up ₹4,000 · Best defence ₹1,500',
  'Vignesh K', '+91 90000 00007', 'active', false, 6
),
(
  'Meme Infinity', 'meme-infinity',
  (select id from public.event_categories where slug = 'non-technical'),
  'A live meme war. Prompts drop every four minutes.',
  'Two devices, one shared screen and a room that decides your fate. Prompts are revealed live and the crowd''s reaction feeds directly into the score. Clean humour only — anything targeting individuals, communities or the institution is removed.',
  '["Individual participation.","Bring your own phone or laptop for editing.","No offensive, political or personal content.","Templates from the internet are allowed; pre-made memes are not.","Audience response accounts for 40% of the score."]'::jsonb,
  '/events/meme-infinity.png',
  '2026-03-14', '11:00', '12:30', 'Studio Hall, Main Block', 1, 1,
  50, 'Winner ₹2,000 · Runner-up ₹1,000',
  'Divya Bharathi', '+91 90000 00008', 'active', true, 7
),
(
  'Shadow Auction', 'shadow-auction',
  (select id from public.event_categories where slug = 'non-technical'),
  'Budgeted bidding war. Build the strongest roster before the purse dies.',
  'Each team gets a fixed purse and an incomplete player list. Bid, bluff and balance — the catch is that three marquee names are only revealed after half the purse is gone. Final rosters are scored by a panel on balance, value and strategy.',
  '["Teams of 2 to 3 participants.","Fixed purse announced at the start. Overspending disqualifies the roster.","A minimum roster composition must be satisfied.","The auctioneer''s call is final."]'::jsonb,
  '/events/shadow-auction.png',
  '2026-03-14', '13:30', '15:30', 'Seminar Hall 2, Main Block', 2, 3,
  100, 'Winner ₹3,000 · Runner-up ₹1,500',
  'Karthik R', '+91 90000 00009', 'active', false, 8
),
(
  'Cine Cipher', 'cine-cipher',
  (select id from public.event_categories where slug = 'non-technical'),
  'Connections, dumb charades and audio rounds — decode the clip.',
  'A cinema quiz wrapped in cryptography. Rounds include visual connections, reversed audio, one-frame stills and a rapid-fire finale. No buzzers — answers are written and revealed simultaneously, so speed matters less than nerve.',
  '["Teams of 2 participants.","Phones are collected before the first round.","Negative marking applies in the rapid-fire round only.","Quizmaster''s decision is final."]'::jsonb,
  '/events/cine-cipher.png',
  '2026-03-14', '10:00', '11:30', 'Auditorium Annexe', 2, 2,
  80, 'Winner ₹2,500 · Runner-up ₹1,200',
  'Meenakshi V', '+91 90000 00010', 'active', false, 9
),
(
  'Endgame Arena', 'endgame-arena',
  (select id from public.event_categories where slug = 'non-technical'),
  'Squad-based mobile gaming knockouts on a live projector feed.',
  'Squads of four fight through group stages into a projected grand final with live commentary from the RootSec media team. Custom rooms, standard competitive settings, no emulators.',
  '["Squads of 4 players.","Mobile devices only. Emulators, triggers and external controllers are banned.","Teaming with other squads results in removal from the bracket.","Room IDs are shared 10 minutes before each match."]'::jsonb,
  '/events/endgame-arena.png',
  '2026-03-14', '11:00', '15:00', 'Gaming Zone, Student Centre', 4, 4,
  200, 'Champion squad ₹5,000 · Runner-up ₹2,500 · MVP ₹1,000',
  'Sanjay T', '+91 90000 00011', 'active', false, 10
),
(
  'Treasure Protocol', 'treasure-protocol',
  (select id from public.event_categories where slug = 'non-technical'),
  'A campus-wide hunt chained by QR codes and cipher fragments.',
  'Eleven checkpoints across the campus, each guarded by a cipher fragment that only makes sense once you hold three of them. Teams move on foot, decode in the open and race a shrinking clue budget.',
  '["Teams of 3 to 4 participants.","One phone per team for scanning QR checkpoints.","Do not remove, damage or hide clue cards.","Restricted areas marked on the campus map are out of bounds.","Each hint taken costs 5 minutes of final time."]'::jsonb,
  '/events/treasure-protocol.png',
  '2026-03-14', '14:00', '16:00', 'Campus wide · Start at Main Quad', 3, 4,
  120, 'Winner ₹3,500 · Runner-up ₹1,800',
  'Praveen A', '+91 90000 00012', 'active', false, 11
)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 5. TEAM MEMBERS
-- ------------------------------------------------------------
insert into public.team_members (name, role, category, photo_url, short_bio, department, year, display_order) values
  ('Dr. A. Ramesh', 'Head of Department', 'Faculty Coordinators', '/placeholder-user.jpg', 'Leads the CSE — Cyber Security department and chairs the symposium committee.', 'CSE — Cyber Security', null, 1),
  ('Prof. K. Divya', 'Staff Coordinator', 'Faculty Coordinators', '/placeholder-user.jpg', 'Faculty advisor for RootSec Club and mentor for the paper presentation track.', 'CSE — Cyber Security', null, 2),
  ('Prof. S. Balaji', 'Technical Advisor', 'Faculty Coordinators', '/placeholder-user.jpg', 'Guides the CTF and forensics tracks.', 'CSE — Cyber Security', null, 3),
  ('Aravind S', 'Student Convenor', 'Organizing Committee', '/placeholder-user.jpg', 'Runs the symposium floor and owns the master schedule.', 'CSE — Cyber Security', 'IV Year', 1),
  ('Nithya R', 'Joint Convenor', 'Organizing Committee', '/placeholder-user.jpg', 'RootSec Club secretary. Designed the Breach Protocol challenge set.', 'CSE — Cyber Security', 'IV Year', 2),
  ('Harish M', 'Forensics Lead', 'Event Coordinators', '/placeholder-user.jpg', 'Builds the disk and memory artefacts for Forensic Gauntlet.', 'CSE — Cyber Security', 'III Year', 1),
  ('Swetha P', 'Coding Events Lead', 'Event Coordinators', '/placeholder-user.jpg', 'Sets the problem ladder for Code Doomsday and Debug the Multiverse.', 'CSE — Cyber Security', 'III Year', 2),
  ('Vignesh K', 'Infrastructure', 'Technical Team', '/placeholder-user.jpg', 'Keeps the scoreboard, lab images and network up during the CTF.', 'CSE — Cyber Security', 'III Year', 1),
  ('Rithika N', 'Web Team', 'Technical Team', '/placeholder-user.jpg', 'Maintains this site and the registration pipeline.', 'CSE — Cyber Security', 'II Year', 2),
  ('Divya Bharathi', 'Design Lead', 'Design Team', '/placeholder-user.jpg', 'Created the SPARTANZ 3.0 visual identity and stage graphics.', 'CSE — Cyber Security', 'II Year', 1),
  ('Sanjay T', 'Media Lead', 'Media Team', '/placeholder-user.jpg', 'Live commentary, reels and the aftermovie.', 'CSE — Cyber Security', 'II Year', 1),
  ('Meenakshi V', 'Hospitality Lead', 'Hospitality Team', '/placeholder-user.jpg', 'Handles guest arrivals, refreshments and the judges'' lounge.', 'CSE — Cyber Security', 'II Year', 1),
  ('Praveen A', 'Registration Lead', 'Registration Team', '/placeholder-user.jpg', 'Runs the desk, verifies teams and issues participation certificates.', 'CSE — Cyber Security', 'III Year', 1),
  ('Karthik R', 'Registration Support', 'Registration Team', '/placeholder-user.jpg', 'On-spot registrations and payment reconciliation.', 'CSE — Cyber Security', 'I Year', 2)
on conflict do nothing;
