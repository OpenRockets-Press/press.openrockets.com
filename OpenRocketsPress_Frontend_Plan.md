 READ THIS AFTER READING THE MAGAZINE V3 POST. 

It took hours to write this, and then AI rephrased. It took much longer than I thought, and about 4 days. So please don't take this lightly. Read everything. 

Open Rockets Press — Full Breakdown
1. What Open Rockets Press Actually Is
Most people do not know what the Press actually is, and that is because of a lack of documentation. That ends here. After reading this, there will be no doubts about implementation.

Think about this: since 2019, since childhood, people have been creating things — pencil sketches, artworks, essays, book covers, inventions, and every kind of creative work. If you open up an old album, go through a drawer, look inside the covers of old books, or flip through old dictionaries, you will find tons of stuff that exists physically — framed pictures, folded papers, things degrading every single day. That is exactly what we are going to solve.

That is a market that is completely untouched. And this is not just one untouched market — we have found multiple dozens of places where the market is completely virgin. That is the power of this. That is how we are going to get into Forbes 30 Under 30. That is how we are going to get into the New York Times. Not by magic, not by intensity — by execution.

The core mission of Open Rockets Press: Protect the intellectual property that minors have accumulated throughout their entire childhood — and protect it completely, sealed for decades into the future. That is the core vision. Open Rockets Press is the direct implementation of that mission.

Timeline urgency: If this is not solidified before turning 18, that is the end of the entire timeline. The news is not going to write about us as "teenagers create a company" if we are already adults. That opportunity does not come back. National newspapers do not cover things like this every single day — it is a rare kind of coverage, and we need to earn it before that window closes.

2. This Is Not an MVP
The stage of minimum viable products has passed. Some MVPs were built — the magazine and other existing things are MVPs. That stage is over. What we are building now is a production-grade product. This is the version we are going to make only minor maintenance updates to over time. That approach saves a significant amount of time for everyone.

3. The Three Divisions of Open Rockets Press
Division 1: Artifacts (Physical & Traditional Creations)
Artifacts are physical or document-based creations. This includes:

Essays
Research preprints
Artworks — sketches, paintings, anything hand-created
Club posters
Book covers and banners
Advertising banners
Graphic designs
Soda can labels
Anything created physically, including clay statues (uploaded via photograph)
Inventions — even something as simple as a blinking LED demonstration counts. The creator takes a professional photograph and submits it.
Diaries — if the creator thinks it is worth sharing, they photograph it and submit it. We accept or decline. That is all.
Accepted file types: PDF, images, Word documents, and any document or visual file type. Users must be able to upload any of these directly — multi-format input is required.

Editing tools: At this stage, we do not need PDF editing, image editing, image cropping, or image scanning tools inside the platform. If those get built in the future, that is wonderful — but they are not required right now.

Moderation determines quality. The quality of the uploaded photograph or file matters and is assessed during moderation.

Division 2: 3D Artifacts (Digital 3D Creations)
This division is for things created in 3D software like Blender, or for physical objects that can be represented in 3D.

File types accepted:

.obj files
3D printer file types (files used to print on 3D printers also count as 3D artifacts)
Display: We do not need to edit the 3D objects at all. We just need to display them properly in the web interface. Use Three.js or any suitable JavaScript library — hundreds of options exist for rendering 3D objects in a browser. The user just needs to be able to hover and drag to see the object from all angles.

The Innovation: Turning Physical Objects Into 3D Views

This is one of the most innovative parts. Most people cannot create 3D clones of physical objects on a computer — they just do not have that skill. But they have a phone. Here is how it works:

Take 4 to 6 photographs of the physical object — front, back, left side, right side, and optionally top and bottom (aerial and bottom view).
The system morphs those edges into a single globe-like view — exactly the way Google Street View and Google Maps work. Google does the same thing: they take multiple images and morph the edges into one navigable globe.
The result is an interactive 360° view where you can drag and rotate the object in the browser.
This is not an AI tool — it is a computational photogrammetry approach that already exists in platforms like Google Maps. We apply the same concept here for physical artifacts created by teenagers — clay statues, models, and anything else they have built. This is what game developers, makers, and creators need.

Division 3: Software & Digital Assets
This is the most important division of Open Rockets Press.

Code:

Users can upload code files directly to Open Rockets Press — Python, JavaScript, C++, C, Rust, or any language. They can upload individual code files or a zip file containing a full code folder.

This works like GitHub Gist, but we need to be innovative about it. GitHub Gist is a code-sharing platform where you paste a code snippet and share it anywhere you need. We do the same thing — but as Open Rockets Press. Users upload their code file or zip, we protect it under one of our licenses (described below), and it is available just like any other artifact on the platform.

Digital Assets broadly:

Anything else that qualifies as digital — digital artwork, digital designs, and similar work — is also accepted in this division.

4. Open Rockets Semi-Open Source Licenses
This is a major part of the digital section. We are not using existing open source licenses. We are creating our own — Open Rockets licenses — which are semi-open source licenses designed specifically to protect the intellectual property of minors while still supporting openness.

Here is what semi-open source means in this context: the work is viewable, but it cannot be copied as-is. If someone copies it, they must differentiate it in a meaningful way. The exact conditions are to be decided by the team — I value your independence in designing this. You decide the exact terms. But the direction is clear: protect the creator's IP while allowing others to reference the work.

Design principles for the licenses:

Number: Create 3 to 4 licenses maximum. Think like Apple — they do not have 10 or 11 products. They have 3 or 4, and those are what they are known for. Same approach here. A small number of well-defined, well-marketed licenses is far more powerful than a large set of confusing ones.
Names: Use animal names. Developers love animal names. Examples: Open Rockets Beaver, Open Rockets Eagle, Open Rockets Kangaroo. Pick whatever names make sense for the conditions of each license. Discuss together and decide.
Mascots: Create a mascot for each license. This is a marketing move. Current open source licenses — GPL, Creative Commons — are extremely boring. Nobody has attacked that. We are attacking it. The mascot should be a clean silhouette or icon — not cartoonish, not childish, but clear and iconic. Think a sharp silhouette of an eagle or beaver. This needs to work for 18 and 19 year olds as well, so it should be something that looks credible and sharp, not like a cartoon.
White paper: We need to publish a white paper on these licenses. I will write it — you create the licenses with their conditions. Open source licenses have no reputation if they are not featured in newspapers, technology magazines, and technology journals. We need to publish a paper on this. That is the plan.
Every submission must choose one. Every artifact, 3D artifact, and code submission on Open Rockets Press must be licensed under one of these Open Rockets licenses. No other licenses are accepted on the platform.
5. How Browsing & Display Works
The browsing experience for Open Rockets Press should look like Amazon Books — not like the magazine.

When you visit Amazon Books, you can see how they categorize content, how they list items, and how clicking on one item takes you to a full dedicated page. That is the model. Specifically:

Every accepted artifact has its own completely separate page
Recommendations are shown at the bottom of each page
Reviews, star ratings, likes, and comments are all available on each page
Categories are clearly differentiated throughout the browsing interface
The layout does not have to be a direct copy of Amazon Books — but the structure and logic should follow the same pattern.

6. Moderation
The moderation process for Open Rockets Press is identical to the magazine. Read the magazine post for the full breakdown of how admin.openrockets.com works, how the API communicates, and how accept/decline functions. The same portal handles the Press — just a separate section inside it.

When a submission is accepted, it is automatically published. Same system, same logic.

7. Storage & Testing
For the storage, same as previously discussed — a 2TB bucket. Create a dedicated bucket for Press separate from other products.

For testing: Use Supabase (S-U-P-A-base). Supabase provides everything needed, equivalent to Cloudflare R2 or Amazon S3, and it works for both the Press and the magazine during testing. We have no fixed deadline for completion, so use Supabase for the testing phase without worrying about switching until the product is ready for production.

8. SEO, Schema & Distribution
Schema markup is required for every single artifact page — just as described in the magazine post. Read that section in the magazine post carefully and apply the exact same approach here.

Link previews: Every artifact page must have proper Open Graph metadata and link preview descriptions. When someone shares a Press page on WhatsApp or Discord, the preview must show the correct title, image, and description. Without these, SEO makes no sense — every page will look identical to a search engine. Read the magazine post for the full implementation details.

Post-moderation distribution: Same Cloudflare Worker strategy as the magazine. When a submission is accepted in admin.openrockets.com, a Cloudflare Worker fires and:

Pings Ping-O-Matic and other applicable pinging services
Posts to a dedicated "Open Rockets Press" X/Twitter account
Posts to a dedicated "Open Rockets Press" Bluesky account (free API)
Posts to a dedicated "Open Rockets Press" Mastodon account (free API)
Posts to any other platform where a free API is available for remote posting
Find any platform where you can get a free API to post remotely — create a profile and integrate it. The more places the content is distributed after approval, the more views and SEO value we generate.

Read the magazine post for the full explanation of this distribution strategy. The exact same approach applies here. Please read that post — it took a tremendous amount of energy to put together.

9. The Business Case — Why This Matters for Valuation
Open Rockets Press is a direct multiplier of our company's market valuation. Here is why.

Every artifact that gets accepted into the platform is:

An authentic, original work — moderation ensures this
Licensable and ownable IP — it cannot be directly patented in every case, but it can be licensed, reserved, and owned under our Open Rockets licenses
Created by a minor — which multiplies the IP value by 5 to 10 times compared to a normal work
Think about it: a 5th grader who has produced a significant piece of work that gets published on our platform — that specific artifact could be worth significantly more than a standard work found anywhere on Google search results. The creator's age and the authenticity of the work make it exceptional.

The numbers:

At just 5,000 accepted artifacts — spanning traditional artifacts, 3D artifacts, and code — our company's paper valuation would increase by at least $100,000 to $200,000 USD. If the platform scales to 20,000 or 30,000+ artifacts, the figure becomes astonishing.

"Paper valuation" means: if an investor wants to buy our company, or if a large nonprofit like Google or an educational company wants to acquire us in the future, this is what they would pay for — specifically for the Press and its authenticated, minor-created IP archive.

The only thing that actually matters here is moderation. We must only accept original, authentic work. That is the entire foundation of the value. If we let anything through, it falls apart. If we hold the standard, this becomes something real and extraordinary.

10. Final Note
Open Rockets Press is one of the greatest things we could build. We have realized what the actual potential is — what the actual untouched market is — and this is it. What I have described here should be implemented exactly as stated. You can add things on top of it, but what is specified here is the baseline that must exist.


If you need implementation details on schema, link previews, or the post-moderation distribution pipeline, read the magazine post. Everything described there applies directly here as well.