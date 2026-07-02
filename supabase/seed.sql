-- Seed data for Nomad Village Growth Engine

-- Default lead stages
insert into lead_stages (name, order_index, color, is_default) values
  ('New Lead',       0, '#6b7280', true),
  ('First Contact',  1, '#3b82f6', false),
  ('Meeting Scheduled', 2, '#8b5cf6', false),
  ('Proposal Sent',  3, '#f59e0b', false),
  ('Negotiation',    4, '#ef4444', false),
  ('Converted',      5, '#10b981', false),
  ('Not Interested', 6, '#9ca3af', false);

-- Sample outreach template
insert into email_templates (name, subject, body_html, body_text, variables, category) values (
  'Initial Outreach - Government',
  'Collaboration Opportunity with Nomad Village — {{department}}',
  '<p>Dear {{first_name}},</p>
<p>I hope this email finds you well. I''m reaching out from <strong>Nomad Village</strong>, an initiative focused on building sustainable nomadic communities across India.</p>
<p>Given {{organization}}''s work in {{department}}, we see a natural alignment and would love to explore potential collaboration.</p>
<p>Would you be open to a brief call next week to discuss this further?</p>
<p>Best regards,<br>The Nomad Village Team</p>',
  'Dear {{first_name}},

I hope this email finds you well. I''m reaching out from Nomad Village, an initiative focused on building sustainable nomadic communities across India.

Given {{organization}}''s work in {{department}}, we see a natural alignment and would love to explore potential collaboration.

Would you be open to a brief call next week to discuss this further?

Best regards,
The Nomad Village Team',
  '{"first_name","organization","department"}',
  'outreach'
);