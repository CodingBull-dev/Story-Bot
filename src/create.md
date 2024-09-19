---
title: Create
layout: "layouts/info.html"
description: Find out how to create the next story
---
Hey there! Are you ready to help our authors write the next set of amazing short stories? Do you want to be a part of inspiring the next generation of literary masterminds? Of course you do!

We need prompt writers to populate our site, and it's a super easy gig. Ready to take the plunge? Click on the link below to get started.

<div class="grid w-full justify-center">
    <div class="card w-full md:w-96 bg-base-100 shadow-xl image-full overflow-hidden">
        <figure><img class="w-full" src="{{ '/img/cyber-background.webp' | url }}" alt="Background" /></figure>
        <div class="card-body items-center text-center">
            <div class="card-actions justify-center">
                <a href="{{ site.create }}" target="_blank">
                    <button id="submit-prompt" data-umami-event="submit-prompt" class="btn btn-wide btn-secondary">To the prompt editor</button>
                </a>
            </div>
        </div>
    </div>
</div>

Now, let's get creative! Let your imagination run wild and come up with a prompt that's silly, weird, or even downright absurd! There are no limits to what you can come up with - so don't hold back!

Once you've submitted your prompt, our system will analyze it and turn it into a story complete with a catchy title and some awesome cover art. Pretty cool, right?

There, you can see your prompt, and if you don't like it, you can always re-roll it for a new one!

So what are you waiting for? Let's get started!

### Current posts in the system

<div class="center-div w-full">
    <div class="stats shadow">
        <div class="stat place-items-center">
            <div class="stat-title">Total Posts</div>
            <div class="stat-value">{{ collections.blog | length }}</div>
            <div class="stat-desc">Help us make this number grow</div>
        </div>
    </div>
</div>
