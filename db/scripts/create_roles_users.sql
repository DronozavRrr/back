
CREATE USER admin_user WITH PASSWORD 'admin123';
GRANT admin_role TO admin_user;


CREATE USER regular_user WITH PASSWORD 'user123';
GRANT user_role TO regular_user;


CREATE USER guest_user WITH PASSWORD 'guest123';
GRANT guest_role TO guest_user;