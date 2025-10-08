import { Routes, Route } from 'react-router-dom';

import AddProduct from "./Pages/AddProduct";
import UpdateProduct from "./Pages/UpdateProduct";
import ShowPage from "./Pages/ShowPage";
import SingleProductPage from "./Pages/SingleProduct"; // import the single product page
import History from "./Pages/History"
import DeleteProduct from "./Pages/DeleteProduct"
import ReturnedProduct from './Pages/ReturnedProduct';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ShowPage />} />
      <Route path="/addProducts" element={<AddProduct />} />
      <Route path="/updateProducts" element={<UpdateProduct />} />
      <Route path="/singlePage/:id" element={<SingleProductPage />} />  {/* Add this route */}
      <Route path='/history' element={<History/>}/>
      <Route path='/deleteProduct' element={<DeleteProduct/>}/>
      <Route path='/returnedProduct' element={<ReturnedProduct/>}/>

    </Routes>
  );
}
