import { useState,useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm,useFieldArray } from "react-hook-form";
import "./App.css";

function App() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      "dcType": "",
      "dcNo": "",
      "dcDate": "",
      "poNo": "",
      "customerName": "",
      "gstInvoiceDate": "",
      "gstInvoiceNo": "",
      "routeId": "",
      "deliveryAddress": "",
      "vehicleNo": "",
      "tripNo": "",
      "totalKms": "",
      "driverName": "",
      "inTime": "",
      "outTime": "",
      "products": [
        {
          "product": "",
          "productDescription": "",
          "quantity": "",
          "uom": "", 
          "cylinderNo": "",
          "customerPartCode": ""  
        }
      ]
    },
  });

  
  const [intime, setinTime] = useState("");
  const [outtime, setoutTime] = useState("");
  const [dcDate, setDcDate] = useState(null);
  const [gstInvoiceDate, setGstInvoiceDate] = useState(null);
  const [records, setRecords] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedRecord, setEditedRecord] = useState(null);
  const [id, setId] = useState(4);
  const [newRecord, setNewRecord] = useState({
    productName: "",
    productDescription: "",
    quantity: "",
    uom: "",
    cylinderNo: "",
    customerPartCode: "",
  });

  const onSubmit = async (data) => {
    try {
      const requestData = { 
        dcType: "Customer", 
        dcNo: data.dcNo,
        dcDate: data.dcDate,
        poNo: data.poNo,
        customerName: data.customerName,
        gstInvoiceNo: data.gstInvoiceNo,
        gstInvoiceDate: data.gstInvoiceDate,
        routeId: data.routeId,
        deliveryAddress: data.deliveryAddress,
        vehicleNo: data.vehicleNo,
        tripNo: data.tripNo,
        totalKms: parseFloat(data.totalKms),
        driverName: data.driverName,
        inTime: data.inTime,
        outTime: data.outTime,
        products: data.products.map((product) => ({
          productName: product.productName || "",
          productDescription: product.productDescription || "",
          quantity: product.quantity ? parseInt(product.quantity, 10) : 0, 
          uom: product.uom || "",
          cylinderNo: product.cylinderNo || "",
          customerPartCode: product.customerPartCode || "",
        })),
      };
  
      console.log("Request Data:", requestData);
  
      const response = await fetch("http://192.168.1.15:8080/api/v1/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
  
      const responseData = await response.json();
      console.log("Response:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create user");
      }
  
      alert("User created successfully!");
      reset(); 
      window.location.reload();
      setRecords([]); 
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  });
  
  const handleSave = async () => {
    try {
      const { dc_id, product_id, productName, productDescription, quantity, uom, cylinderNo, customerPartCode } = editedRecord;

      if (!dc_id || !product_id || !productName || !productDescription || !quantity || !uom || !cylinderNo || !customerPartCode) {
        alert("Missing required fields");
        return;
      }

      const response = await fetch(`http://192.168.1.15:8080/api/v1/editproduct/${dc_id}/${product_id}`, {
        method: 'PUT',  
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: [
            {
              productName,
              productDescription,
              quantity,
              uom,
              cylinderNo,
              customerPartCode,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedRecords = [...records];
        updatedRecords[editingIndex] = { ...editedRecord };
        setRecords(updatedRecords);
        alert("Product updated successfully");
      } else {
        alert("Error updating product: " + data.message);
      }

      setEditingIndex(null);
    } catch (error) {
      console.error('Error while saving the product:', error);
      alert("An error occurred while saving the product");
    }
  };

  const handleAddRecord = () => {
    if (!newRecord.productName || !newRecord.quantity || !newRecord.uom) {
      alert("Please fill in all required fields.");
      return;
    }

    setRecords([...records, newRecord]);
    setNewRecord({
      productName: "",
      productDescription: "",
      quantity: "",
      uom: "",
      cylinderNo: "",
      customerPartCode: "",
    });
    alert("Product added successfully!");
  };


  useEffect(() => {
    fetch("http://192.168.1.15:8080/api/v1/getall")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const formattedRecords = data.data.map((record) => ({
            ...record,
            productName: record.product_name,
            productDescription: record.product_description,
            cylinderNo: record.cylinder_no,
            customerPartCode: record.customer_part_code,
          }));
          setRecords(formattedRecords);
        }
      })
      
      .catch((err) => console.error("Error fetching data:", err));
  }, []);
  

  return (
    <>
      <div className="flex w-full items-center justify-center min-h-screen back-img-register ">
        <div className="w-full p-6 bg-gray-200 shadow-md rounded-lg">
          <h2 className="text-s font-medium mb-4 text-black text-left bg-gray-100">
            Dashboard  &gt; <span className="text-blue-400"> DC</span>
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

            <div className="flex gap-x-4">
              <div className="w-2/8">
                <label className="block text-s font-s text-black text-left">
                  DC Type
                </label>
                <select
                  className="w-full h-6 border border-gray-400 rounded text-black bg-gray-100"
                  {...register("dcType")}
                >
                  <option className="text-black" value="Customer">
                    Customer
                  </option>
                  <option className="text-black" value="vegetable">
                    Vegetable
                  </option>
                  <option className="text-black" value="meat">
                    Meat
                  </option>
                </select>
              </div>

              <div className="w-2/8">
                <label className="block font-s text-black text-left">DC No</label>
                <input type="number" {...register("dcNo")} className="w-full h-6 border border-gray-400 rounded text-black bg-gray-100" />
              </div>

              <div className="w-2/8">
                <label className="block font-s text-black">
                  DC Date
                </label>
                <DatePicker
                  selected={dcDate}
                  onChange={(date) => {
                    const formattedDate = date ? date.toISOString().split('T')[0] : ""; 
                    setDcDate(date);
                    setValue("dcDate", formattedDate);
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="w-full h-6 border text-black border-gray-400 rounded bg-gray-100"
                  wrapperClassName="w-full"
                />
              </div>

              <div className="w-2/8">
                <label className="block font-s text-black">Po No</label>
                <select
                  className="w-full h-6 text-black border border-gray-400 rounded bg-gray-100"
                  {...register("poNo")}
                >
                  <option className="text-black" value="1001">
                    1001
                  </option>
                  <option className="text-black" value="1002">
                    1002
                  </option>
                  <option className="text-black" value="1003">
                    1003
                  </option>
                </select>
              </div>
            </div>

            <div className="flex gap-x-4">
              <div className="w-2/8">
                <label className="block font-s text-black">
                  Customer Name
                </label>
                <input
                  type="text"
                  {...register("customerName")}
                  className="w-full h-6 border border-gray-400 rounded text-black bg-gray-100"
                />
              </div>
              
              <div className="w-2/8">
                <label className="block font-s text-black">
                  GST Invoice No
                </label>
                <input
                  type="number"
                  {...register("gstInvoiceNo")}
                  className="w-full h-6 border border-gray-400 rounded text-black bg-gray-100"
                />
              </div>

              <div className="w-2/8">
                <label className="block font-s text-black">
                  GST Invoice Date
                </label>
                 <DatePicker
                  selected={gstInvoiceDate}
                  onChange={(date) => {
                    const formattedDate = date ? date.toISOString().split('T')[0] : ""; 
                    setGstInvoiceDate(date);
                    setValue("gstInvoiceDate", formattedDate);
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="w-full h-6 border text-black border-gray-400 rounded bg-gray-100"
                  wrapperClassName="w-full"
                />
              </div>

              <div className="w-2/8">
                <label className="block font-s text-black">
                  Route ID
                </label>
                <input
                  type="text"
                  className="w-full h-6 border border-gray-400 rounded text-black bg-gray-100"
                  {...register("routeId")}
                />
              </div>
            </div>

              <div class="wrapper gap-x-4">
                  <div className="box1">
                    <label className="block font-s text-black">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 rounded h-18 text-black bg-gray-100"
                      {...register("deliveryAddress")}
                    />
                  </div>

                  <div className="box2 h-7">
                <label className="block font-s text-black">
                  Vehicle No
                </label>
                <input
                  className="w-full h-6 border border-gray-400 rounded text-black bg-gray-100"
                  type="text"
                  {...register("vehicleNo")}
                />
              </div>

              <div className="box2 h-7">
                <label className="block font-s text-black">
                  Trip No
                </label>
                <input
                  className="w-full h-6 border border-gray-400 rounded text-black bg-gray-100"
                  type="text"
                  {...register("tripNo")}
                />
              </div>

              <div className="box2 h-7">
                <label className="block font-s text-black">
                  Total KMs
                </label>
                <input
                  className="w-full h-6 border border-gray-400 rounded text-black bg-gray-100"
                  type="text"
                  {...register("totalKms")}
                />
              </div>



              <div className="box-2 h-7">
                <label className="block font-s text-black">
                  Driver Name
                </label>
                <select
                  className="w-full h-6 text-black border border-gray-400 rounded bg-gray-100"
                  {...register("driverName")}
                >
                  <option className="text-black" value="Nitin">
                    Nitin
                  </option>
                  <option className="text-black" value="Sagar">
                    Sagar
                  </option>
                  <option className="text-black" value="Raj">
                    Raj
                  </option>
                </select>
              </div>

              <div className="box-2 h-7">
                <label className="w-full h-6 block font-s text-black">
                  In Time
                </label>
                <input
                     type="time"
                     value={intime}
                     onChange={(e) => {
                       setinTime(e.target.value);
                       setValue("inTime", e.target.value);
                     }}
                     className="w-full border h-6 text-black border-gray-400 rounded bg-gray-100"
                   />
              </div>

              <div className="box-2 h-3">
                <label className="block font-s text-black">
                  Out Time
                </label>
                <input
                  type="time"
                  value={outtime}
                  onChange={(e) => {
                    setoutTime(e.target.value);
                    setValue("outTime", e.target.value);
                  }}
                  className="w-full h-6 border p-2 text-black border-gray-400 rounded bg-gray-100"
                />
              </div>
              </div> 
            
            <div>
              <table className="table w-full">
                <thead className="bg-blue-100 w-full">
                  <tr>
                    <th className="border p-5 rounded border-gray-400 text-black text-start font-s text-s w-0.5/12">Sr No</th>
                    <th className="border p-5 rounded border-gray-400 text-black text-start font-s text-s w-3/12">Product</th>
                    <th className="border p-5 rounded border-gray-400 text-black text-start font-s text-s w-3/12">Product Description</th>
                    <th className="border p-5 rounded border-gray-400 text-black text-start font-s text-s w-1/12">Quantity</th>
                    <th className="border p-5 rounded border-gray-400 text-black text-start font-s text-s w-1.3/12">UOM</th>
                    <th className="border p-5 rounded border-gray-400 text-black text-start font-s text-s w-1.4/12">Cylinder No</th>
                    <th className="border p-5 rounded border-gray-400 text-black text-start font-s text-s w-1.3/12">Customer Part Code</th>
                    <th className="border p-5 rounded border-gray-400 text-black text-start font-s text-s w-0.5/12">Action</th>
                  </tr>
                </thead>
               <tbody>
                  {records.map((record, index) => (
                     <tr key={index}>
              <th className="border border-gray-400 p-2 rounded text-black">{index + 1}</th>
              <td className="border border-gray-400 p-2 rounded text-black">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editedRecord.productName}
                    onChange={(e) =>
                      setEditedRecord({ ...editedRecord, productName: e.target.value })
                    }
                    className="border border-gray-400 rounded w-full text-black bg-gray-100"
                  />
                ) : (
                  record.productName
                )}
              </td>
              <td className="border border-gray-400 p-2 rounded text-black">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editedRecord.productDescription}
                    onChange={(e) =>
                      setEditedRecord({ ...editedRecord, productDescription: e.target.value })
                    }
                    className="border border-gray-400 rounded w-full text-black bg-gray-100"
                  />
                ) : (
                  record.productDescription
                )}
              </td>
              <td className="border border-gray-400 p-2 rounded text-black">
                {editingIndex === index ? (
                  <input
                    type="number"
                    value={editedRecord.quantity}
                    onChange={(e) =>
                      setEditedRecord({ ...editedRecord, quantity: e.target.value })
                    }
                    className="border border-gray-400 rounded w-full text-black bg-gray-100"
                  />
                ) : (
                  record.quantity
                )}
              </td>
              <td className="border border-gray-400 p-2 rounded text-black">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editedRecord.uom}
                    onChange={(e) =>
                      setEditedRecord({ ...editedRecord, uom: e.target.value })
                    }
                    className="border border-gray-400 rounded w-full text-black bg-gray-100"
                  />
                ) : (
                  record.uom
                )}
              </td>
              <td className="border border-gray-400 p-2 rounded text-black">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editedRecord.cylinderNo}
                    onChange={(e) =>
                      setEditedRecord({ ...editedRecord, cylinderNo: e.target.value })
                    }
                    className="border border-gray-400 rounded w-full text-black bg-gray-100"
                  />
                ) : (
                  record.cylinderNo
                )}
              </td>
              <td className="border border-gray-400 p-2 rounded text-black">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editedRecord.customerPartCode}
                    onChange={(e) =>
                      setEditedRecord({ ...editedRecord, customerPartCode: e.target.value })
                    }
                    className="border border-gray-400 rounded w-full text-black bg-gray-100"
                  />
                ) : (
                  record.customerPartCode
                )}
              </td>
              <td className="border border-gray-400 p-2 rounded text-black flex justify-center items-center">
                <button
                 style={{ borderRadius: "25px" }}
                type="button"
                  className="!bg-blue-500 text-white !p-1.5 rounded hover:bg-blue-600"
                  onClick={() => {
                    if (editingIndex === index) {
                      handleSave(); 
                    } else {
                      setEditingIndex(index); 
                      setEditedRecord({ ...record });
                    }
                  }}
                >
                  {editingIndex === index ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20px"
                      height="20px"
                      viewBox="0 0 64 64"
                      strokeWidth="3"
                      stroke="white"
                      fill="none"
                    >
                    <path
                      d="M51,53.48H10.52V13A2.48,2.48,0,0,1,13,10.52H46.07l7.41,6.4V51A2.48,2.48,0,0,1,51,53.48Z"
                      strokeLinecap="round"
                    />
                    <rect x="21.5" y="10.52" width="21.01" height="15.5"  strokeLinecap="round" />
                    <rect x="17.86" y="36.46" width="28.28" height="17.02"  strokeLinecap="round" />
                  </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="20px" height="20px" stroke="white"
                      fill="white"><path d="M 46.574219 3.425781 C 45.625 2.476563 44.378906 2 43.132813 2 C 41.886719 2 40.640625 2.476563 39.691406 3.425781 C 39.691406 3.425781 39.621094 3.492188 39.53125 3.585938 C 39.523438 3.59375 39.511719 3.597656 39.503906 3.605469 L 4.300781 38.804688 C 4.179688 38.929688 4.089844 39.082031 4.042969 39.253906 L 2.035156 46.742188 C 1.941406 47.085938 2.039063 47.453125 2.292969 47.707031 C 2.484375 47.898438 2.738281 48 3 48 C 3.085938 48 3.171875 47.988281 3.257813 47.964844 L 10.746094 45.957031 C 10.917969 45.910156 11.070313 45.820313 11.195313 45.695313 L 46.394531 10.5 C 46.40625 10.488281 46.410156 10.472656 46.417969 10.460938 C 46.507813 10.371094 46.570313 10.308594 46.570313 10.308594 C 48.476563 8.40625 48.476563 5.324219 46.574219 3.425781 Z M 45.160156 4.839844 C 46.277344 5.957031 46.277344 7.777344 45.160156 8.894531 C 44.828125 9.222656 44.546875 9.507813 44.304688 9.75 L 40.25 5.695313 C 40.710938 5.234375 41.105469 4.839844 41.105469 4.839844 C 41.644531 4.296875 42.367188 4 43.132813 4 C 43.898438 4 44.617188 4.300781 45.160156 4.839844 Z M 5.605469 41.152344 L 8.847656 44.394531 L 4.414063 45.585938 Z"/></svg>
                  )}
                </button>
              </td>
                     </tr>
                  ))}

                  {fields.map((item, index) => (
                  <tr key={item.id}>
            <th className="border border-gray-400 p-2 rounded text-black">{records.length + 1}</th>
            <td className="border border-gray-400 p-2 rounded text-black">
              <input
                type="text"
                value={newRecord.productName}
                {...register(`products.${index}.productName`)}
                onChange={(e) => setNewRecord({ ...newRecord, productName: e.target.value })}
                className="border border-gray-400 rounded w-full text-black bg-gray-100"
              />
            </td>
            <td className="border border-gray-400 p-2 rounded text-black">
              <input
                type="text"
                value={newRecord.productDescription}
                {...register(`products.${index}.productDescription`)}
                onChange={(e) => setNewRecord({ ...newRecord, productDescription: e.target.value })}
                className="border border-gray-400 rounded w-full text-black bg-gray-100"
              />
            </td>
            <td className="border border-gray-400 p-2 rounded text-black">
              <input
                type="number"
                value={newRecord.quantity}
                {...register("quantity")}
                {...register(`products.${index}.quantity`)}
                onChange={(e) => setNewRecord({ ...newRecord, quantity: e.target.value })}
                className="border border-gray-400 rounded w-full text-black bg-gray-100"
              />
            </td>
            <td className="border border-gray-400 p-2 rounded text-black">
              <input
                type="text"
                value={newRecord.uom}
                {...register("uom")}
                {...register(`products.${index}.uom`)}
                onChange={(e) => setNewRecord({ ...newRecord, uom: e.target.value })}
                className="border border-gray-400 rounded w-full text-black bg-gray-100"
              />
            </td>
            <td className="border border-gray-400 p-2 rounded text-black">
              <input
                type="text"
                value={newRecord.cylinderNo}
                {...register(`products.${index}.cylinderNo`)}
                onChange={(e) => setNewRecord({ ...newRecord, cylinderNo: e.target.value })}
                className="border border-gray-400 rounded w-full text-black bg-gray-100"
              />
            </td>
            <td className="border border-gray-400 p-2 rounded text-black">
              <input
                type="text"
                value={newRecord.customerPartCode}
                {...register("customerPartCode")}
                {...register(`products.${index}.customerPartCode`)}
                onChange={(e) => setNewRecord({ ...newRecord, customerPartCode: e.target.value })}
                className="border border-gray-400 rounded w-full text-black bg-gray-100"
              />
            </td>
            <td className="border border-gray-400 !p-2 rounded text-black flex justify-center items-center">
              <button
                type="button"
                onClick={handleAddRecord}
                className="!bg-blue-500 text-white !p-1 rounded-full !hover:bg-blue-600 flex justify-center items-center"
                style={{ width: "40px", height: "40px", borderRadius: "25px" }} 
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                width="20px"
                height="20px"
                viewBox="0 0 96 96"
              >
              <title />
            <g>
              <path d="M48,0A48,48,0,1,0,96,48,48.0512,48.0512,0,0,0,48,0Zm0,84A36,36,0,1,1,84,48,36.0393,36.0393,0,0,1,48,84Z" />
              <path d="M64.2422,31.7578a5.9979,5.9979,0,0,0-8.4844,0L48,39.5156l-7.7578-7.7578a5.9994,5.9994,0,0,0-8.4844,8.4844L39.5156,48l-7.7578,7.7578a5.9994,5.9994,0,1,0,8.4844,8.4844L48,56.4844l7.7578,7.7578a5.9994,5.9994,0,0,0,8.4844-8.4844L56.4844,48l7.7578-7.7578A5.9979,5.9979,0,0,0,64.2422,31.7578Z" />
              </g>
            </svg>
              </button>
            </td>

                  </tr>
                  ))}

               </tbody>
              </table>
            </div>

            <div className="flex w-1/4 justify-end items-center space-x-2 ml-auto">
            <button
              type="button"
  className="w-1/2 h-8 !bg-red-800 text-white flex justify-center items-center"
              onClick={() => window.location.reload()}
            >
            <span className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                width="20px"
                height="20px"
                viewBox="0 0 96 96"
              >
            <title />
            <g>
              <path d="M48,0A48,48,0,1,0,96,48,48.0512,48.0512,0,0,0,48,0Zm0,84A36,36,0,1,1,84,48,36.0393,36.0393,0,0,1,48,84Z" />
              <path d="M64.2422,31.7578a5.9979,5.9979,0,0,0-8.4844,0L48,39.5156l-7.7578-7.7578a5.9994,5.9994,0,0,0-8.4844,8.4844L39.5156,48l-7.7578,7.7578a5.9994,5.9994,0,1,0,8.4844,8.4844L48,56.4844l7.7578,7.7578a5.9994,5.9994,0,0,0,8.4844-8.4844L56.4844,48l7.7578-7.7578A5.9979,5.9979,0,0,0,64.2422,31.7578Z" />
            </g>
           </svg>
            </span>
            <span>Cancel</span>
          </button>

              <button
                type="submit"
                className="w-1/2 h-8 !bg-blue-500 text-white flex justify-center items-center"
              >
                <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 64 64" stroke-width="3" stroke="white" fill="none"><path d="M51,53.48H10.52V13A2.48,2.48,0,0,1,13,10.52H46.07l7.41,6.4V51A2.48,2.48,0,0,1,51,53.48Z" stroke-linecap="round"/><rect x="21.5" y="10.52" width="21.01" height="15.5" stroke-linecap="round"/><rect x="17.86" y="36.46" width="28.28" height="17.02" stroke-linecap="round"/></svg>
                </span>
                <span>Save</span>
              </button>
            </div>


          </form>
        </div>
      </div>


    </>
  );
}

export default App;
