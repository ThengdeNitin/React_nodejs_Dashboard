const db = require("../config/db");

// Get all User list
const getUser = async (req, res) => {
    try {
  const [data] = await db.query("SELECT * FROM dc_products");
   if (!data) {
     return res.status(404).send({
       success: false,
       message: "No records found",
     });
   }
   res.status(200).send({
     success: true,
     totalUser: data.length,
     message: "All DC products records",
     data
   });
 } catch (error) {
   console.log("Error in getUser API:", error);
   res.status(500).send({
     success: false,
     message: "Error in getting all DC Product records",
     error
   });
    }
};

//Get User according to id
const getUserId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Delivery Challan ID is required",
      });
    }

    // Query to get the delivery challan details
    const [challanData] = await db.query("SELECT * FROM delivery_challans WHERE id = ?", [id]);

    if (challanData.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No Delivery Challan record found",
      });
    }

    // Query to get all products associated with the delivery challan
    const [productsData] = await db.query(
      "SELECT * FROM dc_products WHERE dc_id = ?",
      [id]
    );

    res.status(200).send({
      success: true,
      message: "Delivery Challan record with products found",
      data: {
        challan: challanData[0], // Single delivery challan
        products: productsData, // List of associated products
      },
    });
  } catch (error) {
    console.error("Error in getUser API:", error);
    res.status(500).send({
      success: false,
      message: "Error in fetching Delivery Challan and its products",
      error,
    });
  }
};

//get user by ID
const getUserById = async (req, res) => {
  try {
    const { dc_id, id } = req.params;
    
    if (!id || !dc_id) {
      return res.status(400).send({
        success: false,
        message: "Invalid or missing DC ID and Product ID",
      });
    }

    // Fetch Delivery Challan details
    const [challanData] = await db.query(
      "SELECT * FROM delivery_challans WHERE id = ?",
      [dc_id]
    );

    if (!challanData) {
      return res.status(404).send({
        success: false,
        message: "No Delivery Challan Found",
      });
    }

    // Fetch Product details related to this Challan
    const products = await db.query(
      "SELECT * FROM dc_products WHERE dc_id = ? AND id = ?",
      [dc_id, _id]
    );

    res.status(200).send({
      success: true,
      deliveryChallanDetails: challanData,
      products: products, // This will return an array of products
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in getting delivery challan by ID and Product ID",
      error,
    });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const {
      dcType, dcNo, dcDate, poNo, customerName,
      gstInvoiceNo, gstInvoiceDate, routeId, deliveryAddress,
      vehicleNo, tripNo, totalKms, driverName, inTime, outTime,
      products
    } = req.body;

    // Validate input
    if (!dcType || !dcNo || !dcDate || !poNo || !customerName ||
        !gstInvoiceNo || !gstInvoiceDate || !routeId || !deliveryAddress ||
        !vehicleNo || !tripNo || !totalKms || !driverName || !inTime || !outTime ||
        !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All required fields and at least one product must be provided."
      });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [deliveryResult] = await connection.execute(
        `INSERT INTO delivery_challans 
         (dc_type, dc_no, dc_date, po_no, customer_name, 
          gst_invoice_no, gst_invoice_date, route_id, delivery_address, 
          vehicle_no, trip_no, total_kms, driver_name, in_time, out_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dcType, dcNo, dcDate, poNo, customerName, gstInvoiceNo,
         gstInvoiceDate, routeId, deliveryAddress, vehicleNo,
         tripNo, totalKms, driverName, inTime, outTime]
      );

      const dcId = deliveryResult.insertId;

      // Insert products
      for (const product of products) {
        const { productName, productDescription, quantity, uom, cylinderNo, customerPartCode } = product;
        
        if (!productName || !quantity || !uom) {
          throw new Error("Missing required product fields.");
        }

        await connection.execute(
          `INSERT INTO dc_products (dc_id, product_name, product_description, quantity, uom, cylinder_no, customer_part_code) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [dcId, productName || null, productDescription || null, quantity, uom, cylinderNo || null, customerPartCode || null]
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: "Delivery Challan and products saved successfully"
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error saving products:", error);
      res.status(500).json({
        success: false,
        message: "Error saving delivery challan and products",
        error: error.message
      });
    }
  } catch (error) {
    console.error("Error in createUser API:", error);
    res.status(500).json({
      success: false,
      message: "Error in creating delivery challan",
      error: error.message
    });
  }
};


//Update produts
const addProductsToChallan = async (req, res) => {
  try {
    const { id } = req.params; 
    const { products } = req.body; 

    // Validate input
    if (!id || !products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required fields or product data" });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      
      const [challanResult] = await connection.execute(
        `SELECT id FROM delivery_challans WHERE id = ?`,
        [id]
      );

      if (challanResult.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: "Delivery Challan not found" });
      }

      const productQueries = products.map((product) =>
        connection.execute(
          `INSERT INTO dc_products (dc_id, product_name, product_description, quantity, uom, cylinder_no, customer_part_code) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id, 
            product.productName,
            product.productDescription,
            product.quantity,
            product.uom,
            product.cylinderNo,
            product.customerPartCode,
          ]
        )
      );

      // Execute all product insertions in parallel
      await Promise.all(productQueries);

      // Commit the transaction
      await connection.commit();
      connection.release();

      res.json({ success: true, message: "Products added to the delivery challan successfully" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error adding products:", error);
      res.status(500).json({ success: false, message: "Database error while adding products" });
    }
  } catch (error) {
    console.error("Error in addProductsToChallan API:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

//Edit Produts
const editProductsInChallan = async (req, res) => {
  try {
    const { dc_id, product_id } = req.params; 
    const { products } = req.body; 

    console.log('Received dc_id:', dc_id);
    console.log('Received product_id:', product_id);
    console.log('Received products data:', products);

    if (!dc_id || !product_id || !products || products.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required fields or product data" });
    }

    const productData = products[0]; 
    const { productName, productDescription, quantity, uom, cylinderNo, customerPartCode } = productData;

    if (!productName || !productDescription || !quantity || !uom || !cylinderNo || !customerPartCode) {
      return res.status(400).json({ success: false, message: "Missing required fields in the product data" });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [challanResult] = await connection.execute(
        `SELECT id FROM delivery_challans WHERE id = ?`,
        [dc_id]
      );

      if (challanResult.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: "Delivery Challan not found" });
      }

      const [productResult] = await connection.execute(
        `SELECT product_id FROM dc_products WHERE dc_id = ? AND product_id = ?`,
        [dc_id, product_id]
      );

      if (productResult.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: "Product not found in the specified Delivery Challan" });
      }

      await connection.execute(
        `UPDATE dc_products SET 
          product_name = ?, 
          product_description = ?, 
          quantity = ?, 
          uom = ?, 
          cylinder_no = ?, 
          customer_part_code = ? 
         WHERE dc_id = ? AND product_id = ?`,
        [
          productName,
          productDescription,
          quantity,
          uom,
          cylinderNo,
          customerPartCode,
          dc_id, 
          product_id 
        ]
      );

      await connection.commit();
      connection.release();

      res.json({ success: true, message: "Product updated successfully in the delivery challan" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error updating product:", error);
      res.status(500).json({ success: false, message: "Database error while updating product" });
    }
  } catch (error) {
    console.error("Error in updateProductInChallan API:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


//Delete product 
const deleteUser = async (req, res) => {
  try {
    const dcId = req.params.id;

     if (!dcId) {
       return res.status(400).send({
         success: false,
         message: "Invalid or missing DC ID",
       });
     }

    const [data] = await db.query("DELETE FROM delivery_challans WHERE id = ?", [dcId]);

    if (data.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "Delivery challan not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Delivery Challen deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteUser API:", error);
    res.status(500).send({
      success: false,
      message: "Error in delete API",
      error: error.message,
    });
  }
};


module.exports = { getUser,getUserId,getUserById,createUser,addProductsToChallan,editProductsInChallan,deleteUser };
