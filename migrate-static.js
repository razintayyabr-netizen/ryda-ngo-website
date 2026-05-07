const https = require('https');

const STATIC_NEWS = [
  {
    id: "nr-1",
    title: "RYDA Releases Documentation Brief on Restrictions on Fundamental Freedoms",
    category: "Report",
    author: "RYDA Team",
    summary: "A new RYDA briefing highlights restrictions on expression, movement, and association affecting Rohingya communities across camps and crisis zones.",
    date: "2026-03-18T12:00:00Z",
    content: "<p>The Rohingya Youth Development Association (RYDA) has released a comprehensive documentation brief examining the severe restrictions on fundamental freedoms affecting Rohingya communities. The brief details systematic violations of freedom of expression, movement, and association across refugee camps and crisis zones.</p><h2>Key Findings</h2><p>The documentation reveals a pattern of increasingly restrictive measures that limit the ability of Rohingya individuals and communities to exercise their basic human rights. These restrictions have intensified in recent months, creating a climate of fear and self-censorship.</p><p>RYDA's field researchers documented over 47 incidents of movement restrictions in the first quarter of 2026 alone, affecting an estimated 12,000 individuals across multiple camp sectors.</p><h2>Recommendations</h2><p>The brief calls on international stakeholders to urgently address these violations through coordinated diplomatic pressure, increased monitoring, and direct engagement with community representatives.</p>",
    tags: ["human-rights", "documentation", "freedoms"],
    featured_image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80",
  },
  {
    id: "nr-2",
    title: "Youth Leadership Training Expands Community Representation",
    category: "Leadership",
    author: "RYDA Team",
    summary: "Leadership workshops are helping Rohingya youths, girls, and women strengthen advocacy, organization, and public engagement skills.",
    date: "2026-03-10T12:00:00Z",
    content: "<p>RYDA's Youth Leadership Training program has entered its third phase, expanding to reach more young Rohingya leaders across communities. The program focuses on building practical skills in advocacy, community organization, and public engagement.</p><h2>Program Highlights</h2><p>Over 120 young leaders — including 68 young women — have completed the training modules this quarter. Participants have reported increased confidence in representing their communities in meetings with international organizations and local administrators.</p><p>The training curriculum covers public speaking, rights-based advocacy, conflict resolution, and digital literacy, equipping participants with tools for effective community leadership.</p><h2>Impact</h2><p>Graduates of the program are already making measurable impact. Several have been selected as community representatives, and three participants have been invited to present at regional conferences on refugee rights.</p>",
    tags: ["youth", "leadership", "training"],
    featured_image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
  },
  {
    id: "nr-3",
    title: "RYDA Submits Briefing to UN Special Rapporteur",
    category: "Advocacy",
    author: "RYDA Advocacy Unit",
    summary: "RYDA submitted a detailed briefing to the UN Special Rapporteur outlining documented violations and urging stronger international protection measures.",
    date: "2026-02-28T12:00:00Z",
    content: "<p>The Rohingya Youth Development Association has submitted a formal briefing paper to the United Nations Special Rapporteur on the situation of human rights in Myanmar. The document outlines documented violations and provides recommendations for enhanced international protection measures.</p><h2>Briefing Contents</h2><p>The submission includes testimonies from affected individuals, data from RYDA's monitoring network, and a legal analysis of the obligations of relevant states under international humanitarian law.</p><p>Key areas covered include: arbitrary detention, restrictions on movement, denial of education access, and limitations on humanitarian operations in affected areas.</p><h2>Call to Action</h2><p>RYDA urges the Special Rapporteur to include the perspectives of Rohingya-led organizations in upcoming reports and to advocate for independent monitoring mechanisms with direct community participation.</p>",
    tags: ["UN", "advocacy", "human-rights"],
    featured_image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
  },
  {
    id: "nr-4",
    title: "Emergency Response: Food and Medical Aid in Cox's Bazar",
    category: "Emergency",
    author: "RYDA Relief Team",
    summary: "Following flooding, RYDA coordinated emergency food parcels, hygiene kits, and basic medical support for affected families.",
    date: "2026-02-14T12:00:00Z",
    content: "<p>In response to severe flooding that affected thousands of families in Cox's Bazar refugee camps, RYDA mobilized an emergency relief operation delivering critical supplies to the most vulnerable households.</p><h2>Response Details</h2><p>Within 48 hours of the flooding, RYDA teams distributed:</p><ul><li>850 emergency food parcels containing rice, lentils, oil, and nutritional supplements</li><li>1,200 hygiene kits with soap, water purification tablets, and sanitary supplies</li><li>Mobile medical teams providing first aid and referrals to 340 individuals</li></ul><h2>Ongoing Needs</h2><p>The situation remains critical, with many families still displaced from their shelters. RYDA continues to coordinate with partner organizations to ensure sustained delivery of essential services during the recovery period.</p>",
    tags: ["emergency", "cox-bazar", "relief"],
    featured_image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
  },
  {
    id: "nr-5",
    title: "RYDA Issues Public Statement on Arbitrary Detention Reports",
    category: "Statement",
    author: "RYDA Team",
    summary: "RYDA is deeply concerned by verified reports of arbitrary detention and calls on authorities to uphold international human rights standards.",
    date: "2026-01-30T12:00:00Z",
    content: "<p>The Rohingya Youth Development Association expresses deep concern regarding verified reports of arbitrary detention of Rohingya individuals. These actions represent a clear violation of international human rights standards and must be addressed with urgency.</p><h2>Our Position</h2><p>RYDA has documented multiple cases of individuals being detained without charge, denied access to legal representation, and held in conditions that fall below minimum international standards for the treatment of detainees.</p><p>We call on all relevant authorities to:</p><ul><li>Immediately release all individuals detained without lawful basis</li><li>Ensure access to legal representation for all detainees</li><li>Allow independent monitoring of detention facilities</li><li>Provide transparent reporting on the status and conditions of detained individuals</li></ul><h2>Commitment</h2><p>RYDA will continue to document and publicly report on these violations as part of our mandate to protect the human rights of Rohingya communities.</p>",
    tags: ["statement", "detention", "human-rights"],
    featured_image: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=80",
  },
  {
    id: "nr-6",
    title: "New Research Report: Education Barriers Facing Rohingya Youth",
    category: "Report",
    author: "RYDA Research Unit",
    summary: "A new RYDA publication documents systemic barriers preventing Rohingya children from accessing quality education, with policy recommendations.",
    date: "2026-01-18T12:00:00Z",
    content: "<p>RYDA's Research Unit has published a comprehensive report examining the systemic barriers that prevent Rohingya children and youth from accessing quality education. The report draws on extensive field research and presents actionable policy recommendations.</p><h2>Research Findings</h2><p>The study surveyed 500 families across 12 camp sectors, revealing that:</p><ul><li>73% of Rohingya youth aged 15-24 have had their education disrupted for more than 3 years</li><li>Only 12% of school-age girls have access to any form of structured learning</li><li>Language barriers and lack of accredited curricula remain the most significant obstacles</li></ul><h2>Policy Recommendations</h2><p>The report recommends the adoption of the Myanmar curriculum in relevant languages, accreditation of learning programs, and the inclusion of Rohingya educators in program design and delivery.</p><p>RYDA calls on education sector partners to prioritize these recommendations in their 2026-2027 programming cycles.</p>",
    tags: ["research", "education", "youth"],
    featured_image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  },
];

let done = 0;
STATIC_NEWS.forEach(post => {
  const body = JSON.stringify(post);
  const req = https.request({
    hostname: 'rydarohingya.org',
    path: '/api/posts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Writer-Token': '12345678',
      'Content-Length': Buffer.byteLength(body)
    }
  }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      done++;
      console.log(`[${done}/${STATIC_NEWS.length}] ${post.id} → ${res.statusCode}`);
      if (done === STATIC_NEWS.length) console.log('\nAll static posts added to Redis!');
    });
  });
  req.on('error', e => { done++; console.error('Error:', e.message); });
  req.write(body);
  req.end();
});
