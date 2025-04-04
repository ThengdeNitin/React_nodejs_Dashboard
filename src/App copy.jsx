import { useState,useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import "./App.css";

function App() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      "dcType": "Customer",
      "dcNo": "615",
      "dcDate": "12-12-2012",
      "poNo": "1001",
      "customerName": "Nitin",
      "gstInvoiceDate": "12-12-2012",
      "gstInvoiceNo": "216",
      "routeId": "216",
      "deliveryAddress": "Pune",
      "vehicleNo": "6549",
      "tripNo": "659",
      "totalKms": "654",
      "driverName": "Nitin",
      "inTime": "10:12",
      "outTime": "5:10",
      "products": [
        {
          "product": "Mobile",
          "productDescription": "For calling",
          "quantity": "1",
          "uom": "pcs",  // Make sure this is specified
          "cylinderNo": "1",
          "customerPartCode": "CPC001"  // Add customerPartCode if necessary
        }
      ]
    },
  });

  
  const [intime, setinTime] = useState("");
  const [outtime, setoutTime] = useState("");
  const [dcDate, setDcDate] = useState(null);
  const [gstInvoiceDate, setGstInvoiceDate] = useState(null);
  const [records, setRecords] = useState([]);
  const [product, setProduct] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [uom, setUom] = useState("");
  const [cylinderNo, setCylinderNo] = useState("");
  const [customerPartCode, setCustomerPartCode] = useState("");

  const handleAddRecord = () => {
    const newRecord = {
      product,
      productDescription,
      quantity,
      uom,
      cylinderNo,
      customerPartCode,
    };

    setRecords([...records, newRecord]);

    setProduct("");
    setProductDescription("");
    setQuantity("");
    setUom("");
    setCylinderNo("");
    setCustomerPartCode("");
  };

  const onSubmit = async (data) => {
    try {
      const requestData = { ...data, products: records };
  
      console.log("Request Data:", requestData);
  
      const response = await fetch("http://192.168.1.4:8080/api/v1/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Account already exists");
      }
  
      alert("Account created successfully!");
      reset();
    } catch (error) {
      alert(error.message);
    }
  };
  
  useEffect(() => {
    fetch("http://192.168.1.4:8080/api/v1/getall")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const formattedRecords = data.data.map((record) => ({
            ...record,
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
      <div className="flex items-center justify-center min-h-screen back-img-register">
        <div className="max-w-7xl w-full p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center text-black">
            Dashboard DC
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex">
              <div className="w-2/8">
                <label className="block font-semibold text-black">
                  DC Type
                </label>
                <select
                  className="border border-gray-400 rounded text-black"
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
                <label className="block font-semibold text-black">DC No</label>
                <input
                  className="border border-gray-400 rounded text-black"
                  type="Number"
                />
              </div>

              <div className="w-2/8">
                <label className="block font-semibold text-black">
                  DC Date
                </label>
                <DatePicker
                  selected={dcDate}
                  onChange={(date) => setDcDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-400 rounded text-black"
                />
              </div>

              <div className="w-2/8">
                <label className="block font-semibold text-black">Po No</label>
                <select
                  className="text-black border border-gray-400 rounded"
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

            <div className="flex">
              <div className="w-2/8">
                <label className="block font-semibold text-black">
                  Customer Name
                </label>
                <input
                  type="text"
                  className="border border-gray-400 rounded text-black"
                />
              </div>

              <div className="w-2/8">
                <label className="block font-semibold text-black">
                  GST Invoice No
                </label>
                <input
                  type="number"
                  className="border border-gray-400 rounded text-black"
                />
              </div>

              <div className="w-2/8">
                <label className="block font-semibold text-black">
                  GST Invoice Date
                </label>
                <DatePicker
                  selected={gstInvoiceDate}
                  onChange={(date) => setGstInvoiceDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-400 rounded text-black"
                />
              </div>

              <div className="w-2/8">
                <label className="block font-semibold text-black">
                  Route ID
                </label>
                <input
                  type="text"
                  className="border border-gray-400 rounded text-black"
                  {...register("routeId")}
                />
              </div>
            </div>

            <div className="flex">
              <div className="w-2/8">
                <label className="block font-semibold text-black">
                  Delivery Address
                </label>
                <input
                  type="text"
                  className="border border-gray-400 rounded h-21 text-black"
                  {...register("deliveryAddress")}
                />
              </div>

              <div className="w-2/8 h-7">
                <label className="block font-semibold text-black">
                  Vehicle No
                </label>
                <input
                  className="border border-gray-400 rounded text-black"
                  type="text"
                  {...register("vehicleNo")}
                />
              </div>

              <div className="w-2/8 h-7">
                <label className="block font-semibold text-black">
                  Trip No
                </label>
                <input
                  className="border border-gray-400 rounded text-black"
                  type="text"
                  {...register("tripNo")}
                />
              </div>

              <div className="w-2/8 h-7">
                <label className="block font-semibold text-black">
                  Total KMs
                </label>
                <input
                  className="border border-gray-400 rounded text-black"
                  type="text"
                  {...register("totalKms")}
                />
              </div>

              <div className="w-2/8 h-7">
                <label className="block font-semibold text-black">
                  Driver Name
                </label>
                <select
                  className="text-black border border-gray-400 rounded"
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

              <div className="w-2/8 h-7">
                <label className="block font-semibold text-black">
                  In Time
                </label>
                <input
                  type="time"
                  value={intime}
                  onChange={(e) => setinTime(e.target.value)}
                  className="border border-gray-400 p-2 rounded text-black"
                />
              </div>

              <div className="w-2/8 h-7">
                <label className="block font-semibold text-black">
                  Out Time
                </label>
                <input
                  type="time"
                  value={outtime}
                  onChange={(e) => setoutTime(e.target.value)}
                  className="border border-gray-400 p-2 rounded text-black"
                />
              </div>
            </div>

            <div>
              <table className="table w-full">
                <thead className="bg-blue-100">
                  <tr>
                    <th
                      scope="col"
                      className="border border-gray-400 p-2 rounded text-black"
                    >
                      Sr No
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-400 p-2 rounded text-black"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-400 p-2 rounded text-black"
                    >
                      Product Description
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-400 p-2 rounded text-black"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-400 p-2 rounded text-black"
                    >
                      UOM
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-400 p-2 rounded text-black"
                    >
                      Cylinder No
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-400 p-2 rounded text-black"
                    >
                      Customer Part Code
                    </th>
                    <th
                      scope="col"
                      className="border border-gray-400 p-2 rounded text-black"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                {records.map((record, index) => (
  <tr key={index}>
    <th className="border border-gray-400 p-2 rounded text-black">
      {index + 1}
    </th>
    <td className="border border-gray-400 p-2 rounded text-black">
      {record.product}
    </td>
    <td className="border border-gray-400 p-2 rounded text-black">
      {record.product_description}
    </td>
    <td className="border border-gray-400 p-2 rounded text-black">
      {record.quantity}
    </td>
    <td className="border border-gray-400 p-2 rounded text-black">
      {record.uom}
    </td>
    <td className="border border-gray-400 p-2 rounded text-black">
      {record.cylinder_no}
    </td>
    <td className="border border-gray-400 p-2 rounded text-black">
      {record.customer_part_code}
    </td>
    <td className="border border-gray-400 p-2 rounded text-black">
      <button
        type="button"
        onClick={handleAddRecord}
        className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Add
      </button>
      <button
        type="button"
        className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Edit
      </button>
    </td>
  </tr>
))}

                  <tr>
                    <th
                      scope="row"
                      className="border border-gray-400 p-2 rounded text-black"
                    >
                      1
                    </th>
                    <td className="border border-gray-400 p-2 rounded text-black">
                      <select className="text-black w-full">
                        <option className="text-black" value="Mobile">
                          Mobile
                        </option>
                        <option className="text-black" value="Laptop">
                          Laptop
                        </option>
                        <option className="text-black" value="Ac">
                          Ac
                        </option>
                      </select>
                    </td>
                    <td className="border border-gray-400 p-2 rounded text-black">
                      <input
                        type="text"
                        className="border border-gray-400 rounded w-full text-black"
                      />
                    </td>
                    <td className="border border-gray-400 p-2 rounded text-black">
                      <input
                        type="number"
                        className="border border-gray-400 rounded w-full text-black"
                      />
                    </td>
                    <td className="border border-gray-400 p-2 rounded text-black">
                      <select className="text-black w-full">
                        <option className="text-black" value="1">
                          1
                        </option>
                        <option className="text-black" value="2">
                          2
                        </option>
                        <option className="text-black" value="3">
                          3
                        </option>
                      </select>
                    </td>
                    <td className="border border-gray-400 p-2 rounded text-black">
                      <input
                        type="number"
                        className="border border-gray-400 rounded w-full text-black"
                      />
                    </td>
                    <td className="border border-gray-400 p-2 rounded text-black">
                      <input
                        type="number"
                        className="border border-gray-400 rounded w-full text-black"
                      />
                    </td>
                    <td className="border border-gray-400 p-2 rounded text-black flex">
                      <button
                        type="submit"
                        className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                      >
                        edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex">
              <button
                type="button"
                className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
