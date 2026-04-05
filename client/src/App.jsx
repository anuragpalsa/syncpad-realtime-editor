import Editor from "./components/editor";
import {BrowserRouter , Routes , Route } from "react-router-dom";
import Home from "./Home";
import "./index.css";


function App() {
  return(
     //<Editor />
    <BrowserRouter>
    <Routes>
      <Route path = "/" element = {<Home />} />
      <Route path = "/doc/:id" element = {<Editor />}  />
    </Routes>
    </BrowserRouter>
    
  );
  
}

export default App;