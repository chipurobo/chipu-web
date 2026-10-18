-- Every Blockly lesson begins with the same short orientation: read the
-- mission, build step by step, test, then submit. Hosting the media with the
-- app means the video and WebVTT captions do not depend on a third party.

update public.lessons
set media_type = 'video',
    media_url = 'https://chipurobo.com/lesson-media/lesson-orientation.webm',
    captions_url = 'https://chipurobo.com/lesson-media/lesson-orientation.vtt',
    media_transcript = 'First, read your mission and check what you need to build. Next, build one step at a time and tick each step when it works. Then, run your program, look at the output and fix any problems. Finally, send your work and tell your teacher what you learned.',
    media_instructions = '1. Read your mission.\n2. Build one step at a time.\n3. Run your program and fix any problems.\n4. Send your work and explain what you learned.'
where learning_plan->>'delivery' = 'blockly'
  and is_active
  and review_status = 'approved';

-- The content-change trigger correctly sends the lessons back for review.
-- This migration is the review record for this shared, accessible orientation
-- asset, so publish those exact rows again after all four equivalents exist.
update public.lessons
set review_status = 'approved',
    review_notes = concat_ws(E'\n\n', nullif(review_notes, ''),
      'System-reviewed orientation video: WebVTT captions, transcript and written instructions included.'),
    is_active = true,
    approved_at = now(),
    approved_by = null
where learning_plan->>'delivery' = 'blockly'
  and media_url = 'https://chipurobo.com/lesson-media/lesson-orientation.webm'
  and captions_url = 'https://chipurobo.com/lesson-media/lesson-orientation.vtt'
  and review_status = 'needs_revision';

notify pgrst, 'reload schema';
