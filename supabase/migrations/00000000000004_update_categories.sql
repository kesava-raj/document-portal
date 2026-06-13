-- Replace the existing seeded categories with the new list

update categories set name = 'User Manual' where id = 1;
update categories set name = 'Technical Manual' where id = 2;
update categories set name = 'Knowledge Transfer' where id = 3;
update categories set name = 'Onboarding Document' where id = 4;
update categories set name = 'Troubleshooting Document' where id = 5;
