const https = require('https');

const articles = [
  {
    title: "RYDA Condemns Escalating Violence in Rakhine State",
    summary: "The Rohingya Youth Development Association issued a strong condemnation of the escalating violence affecting Rohingya communities in Rakhine State, calling for immediate international intervention.",
    content: "<p>The Rohingya Youth Development Association (RYDA) strongly condemns the escalating violence in Rakhine State, which has resulted in further displacement and human rights violations against Rohingya communities.</p><h2>Background</h2><p>Recent reports indicate intensified military operations and communal violence, leading to additional displacement of Rohingya civilians. RYDA's monitoring network has documented multiple incidents of arbitrary detention, destruction of property, and restrictions on movement.</p><h2>Our Position</h2><p>RYDA calls on the international community to take immediate action to protect civilians and hold perpetrators accountable. We urge the UN Security Council to address this crisis and demand that the Myanmar military cease all violations against Rohingya people.</p><h2>Documented Incidents</h2><p>Since January 2026, RYDA's documentation team has recorded over 120 incidents of rights violations, including arbitrary arrests, extortion, and denial of humanitarian access. These incidents represent a clear pattern of systematic oppression.</p><p>RYDA remains committed to documenting these violations and advocating for justice on behalf of affected communities.</p>",
    category: "Statement",
    author: "RYDA Team",
    featured_image: "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=800&q=80",
    tags: ["myanmar", "rakhine", "violence", "statement", "advocacy"]
  },
  {
    title: "Documentation Report: Arbitrary Detentions in Rohingya Communities",
    summary: "RYDA releases a comprehensive documentation report on arbitrary detentions of Rohingya individuals, with testimonies from affected families and recommendations for action.",
    content: "<p>This report documents 47 cases of arbitrary detention of Rohingya individuals documented by RYDA's field teams between October 2025 and March 2026. The cases represent a fraction of the actual incidents, as many go unreported due to fear of retaliation.</p><h2>Methodology</h2><p>RYDA's documentation team conducted interviews with victims' families, witnesses, and community leaders. All information was verified through cross-referencing multiple sources where possible.</p><h2>Key Findings</h2><p>The report documents detention practices that violate international human rights law, including detention without charge, denial of legal representation, and incommunicado detention. Several cases involved individuals detained for simply being present in areas targeted by security forces.</p><h2>Recommendations</h2><p>RYDA calls on relevant authorities to release all arbitrarily detained individuals, allow independent monitors access to detention facilities, and investigate all allegations of ill-treatment.</p>",
    category: "Report",
    author: "RYDA Documentation Team",
    featured_image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80",
    tags: ["documentation", "arbitrary-detention", "report", "myanmar"]
  },
  {
    title: "Youth Leadership Summit Draws 200+ Participants from Cox's Bazar Camps",
    summary: "RYDA's annual Youth Leadership Summit brought together over 200 young Rohingya leaders from camps across Cox's Bazar for three days of training, dialogue, and strategic planning.",
    content: "<p>The Rohingya Youth Development Association successfully hosted its Annual Youth Leadership Summit at the RYDA Community Center in Cox's Bazar, bringing together over 200 young Rohingya leaders from refugee camps across the district.</p><h2>Summit Highlights</h2><p>Over three days, participants engaged in workshops covering advocacy skills, community organizing, documentation techniques, media engagement, and mental health support. The summit provided a platform for young people to share experiences, build networks, and develop collective strategies for positive change.</p><h2>Key Sessions</h2><p>Interactive sessions on human rights documentation equipped participants with skills to safely and accurately document violations in their communities. A separate track focused on women's leadership, encouraging young women to take active roles in community decision-making.</p><h2>Outcomes</h2><p>Participants developed action plans for community initiatives addressing education, protection, and livelihood challenges. RYDA committed to supporting selected youth-led projects with small grants and ongoing mentorship.</p>",
    category: "Leadership",
    author: "RYDA Team",
    featured_image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    tags: ["youth", "leadership", "summit", "cox-bazar", "training"]
  },
  {
    title: "Emergency Response: Monsoon Flood Relief Operation",
    summary: "Following devastating monsoon floods in Cox's Bazar camps, RYDA launched an emergency response delivering food, water, and shelter materials to 1,500 affected families.",
    content: "<p>Heavy monsoon rains triggered severe flooding across multiple refugee camps in Cox's Bazar, affecting an estimated 8,000 individuals. RYDA immediately activated its emergency response protocol.</p><h2>Response Operations</h2><p>Within 72 hours of the flooding, RYDA teams had reached 1,500 families with emergency supplies including food parcels, clean water, hygiene kits, and emergency shelter materials. Medical volunteers were deployed to treat cases of waterborne diseases and injuries.</p><h2>Distribution Details</h2><p>RYDA distributed over 4,500kg of rice, 1,200 liters of clean drinking water, 800 hygiene kits, and 400 tarpaulin sheets for emergency shelter repairs. Teams worked around the clock to ensure the most vulnerable—children under 5, pregnant women, and elderly individuals—received prioritized assistance.</p><h2>Continued Needs</h2><p>The relief operation continues as floodwaters recede, with teams assessing longer-term shelter repair needs and monitoring for disease outbreaks. RYDA appeals for continued support from partners and donors.</p>",
    category: "Emergency",
    author: "RYDA Emergency Response Team",
    featured_image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
    tags: ["emergency", "flood", "relief", "cox-bazar", "humanitarian"]
  },
  {
    title: "Research: Barriers to Education Access for Rohingya Refugee Children",
    summary: "RYDA publishes research findings on the structural barriers preventing Rohingya refugee children from accessing quality education in Bangladesh camps.",
    content: "<p>This research paper examines the barriers to education access for Rohingya refugee children in Cox's Bazar camps, drawing on surveys with 340 households and interviews with 45 educators and community leaders.</p><h2>Background</h2><p>While some informal learning centers operate in the camps, formal education remains severely restricted. This research identifies the key barriers preventing children from accessing even the limited educational opportunities available.</p><h2>Key Findings</h2><p>The study found that 67% of children aged 6-14 were not enrolled in any form of structured learning. Primary barriers include: lack of certified teachers, insufficient learning materials, economic pressures pushing children toward work, safety concerns especially for girls, and curriculum restrictions imposed by host country regulations.</p><h2>Recommendations</h2><p>RYDA recommends expanded investment in community-based education programs, teacher training initiatives, advocacy for formal education recognition, and targeted support for girls' education. The full report includes detailed appendices with survey instruments and statistical analysis.</p>",
    category: "Research",
    author: "RYDA Research Team",
    featured_image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
    tags: ["education", "research", "children", "refugees", "access"]
  }
];

let uploaded = 0;
articles.forEach(post => {
  const body = JSON.stringify(post);
  const req = https.request({
    hostname: 'rydarohingya.org',
    path: '/api/posts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Writer-Token': '12345678'
    }
  }, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      uploaded++;
      console.log(`[${uploaded}/${articles.length}] Status: ${res.statusCode}`, JSON.parse(data).post?.title || data);
      if (uploaded === articles.length) console.log('\nAll done!');
    });
  });
  req.on('error', e => { uploaded++; console.error('Error:', e.message); });
  req.write(body);
  req.end();
});
