# React_nodejs_Dashboard
Dashboard using ReactJs NodeJs MySQL <br/>
Create a Database Using MySQL(I have given nodejs_db) and Creat tabel <br/>

CREATE TABLE delivery_challans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dc_type VARCHAR(50),
    dc_no INT,
    dc_date DATE,
    po_no INT,
    customer_name VARCHAR(255),
    gst_invoice_no INT,
    gst_invoice_date DATE,
    route_id VARCHAR(50),
    delivery_address TEXT,
    vehicle_no VARCHAR(50),
    trip_no VARCHAR(50),
    total_kms FLOAT,
    driver_name VARCHAR(255),
    in_time TIME,
    out_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); <br/>

CREATE TABLE dc_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dc_id INT,
    product_name VARCHAR(255),
    product_description TEXT,
    quantity INT,
    uom VARCHAR(50),
    cylinder_no VARCHAR(50),
    customer_part_code VARCHAR(50),
    FOREIGN KEY (dc_id) REFERENCES delivery_challans(id) ON DELETE CASCADE
); <br/>

Do the basic configration with nodejs  <br/>
install node_modules and all

