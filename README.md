# Ohana Jewells Junk Removal LLC — Demo Website

A fast, mobile-friendly, veteran-owned junk removal website built as a production-ready demo and lead-capture funnel.

Live site: https://powerman2824.github.io/ohana-jewells-junk-removal/

## Features
- Modern one-page layout (Hero → Services → How it Works → Areas → About → Quote)
- Mobile call bar (sticky “Call Now” on small screens)
- Quote form with:
  - On-page submit (no redirects)
  - Attachment support (optional photos)
  - Parsed hidden fields (first name, last name, city, state)
  - Compiled message formatting for clean inbox/CRM notes
- Privacy Policy page
- Social sharing support (Open Graph / Twitter cards) + favicon
- Basic structured data (JSON-LD)

## Lead / CRM Flow (How it Works)

When a user submits a quote request, the form stays on the website and is sent via AJAX:

### Data captured
- Name
- Phone
- Email
- Pickup town (city/state parsing)
- Job details
- Optional photo uploads
- Auto-generated “Contact Tag” (City_FirstName)
- Auto-compiled message body (easy to read)
