-- The lesson catalog now has thirteen trigonometry lessons.
alter table public.course_lessons
  drop constraint course_lessons_lesson_order_check;

alter table public.course_lessons
  add constraint course_lessons_lesson_order_check
  check (
    (module_id = 'trigonometry' and lesson_order between 1 and 13)
    or (module_id <> 'trigonometry' and lesson_order between 1 and 5)
  );

insert into public.course_lessons (lesson_id, module_id, lesson_order, xp_reward) values
  ('trig-lesson-6', 'trigonometry', 6, 60),
  ('trig-lesson-7', 'trigonometry', 7, 60),
  ('trig-lesson-8', 'trigonometry', 8, 60),
  ('trig-lesson-9', 'trigonometry', 9, 60),
  ('trig-lesson-10', 'trigonometry', 10, 60),
  ('trig-lesson-11', 'trigonometry', 11, 60),
  ('trig-lesson-12', 'trigonometry', 12, 60),
  ('trig-lesson-13', 'trigonometry', 13, 60);

-- Only signed-in learners may invoke the completion RPC.
revoke all on function public.record_lesson_completion(text) from public, anon;
grant execute on function public.record_lesson_completion(text) to authenticated;
