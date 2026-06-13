-- Update category 3 to be the combined category
update categories set name = 'Knowledge Transfer & Onboarding Document' where id = 3;

-- Move any existing documents from category 4 (Onboarding Document) to category 3
update documents set category_id = 3 where category_id = 4;

-- Delete the old Onboarding Document category
delete from categories where id = 4;
