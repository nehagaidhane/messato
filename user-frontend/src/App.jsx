import AppRoutes from "./routes/AppRoutes";
import "./App.css";
import Navbar from "./components/navbar";

function App() {
  return <div className="nb-layout-body">
    <Navbar onSearch={(q) => console.log(q)} />
    < AppRoutes />
  </div>
}

export default App;
