SET search_path TO todo_list;
ALTER TABLE habits ALTER COLUMN color TYPE VARCHAR(7) USING color::text;
