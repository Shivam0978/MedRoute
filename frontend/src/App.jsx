import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/index";
import Hospitals from "./pages/hospitals";
import Nearby from "./pages/nearby";
import Doctors from "./pages/doctors";
import Appointments from "./pages/appointments";
import Emergency from "./pages/emergency";
import AIAssistant from "./pages/ai-assistant";
import BloodBank from "./pages/blood-bank";
import Pharmacy from "./pages/pharmacy";
import Schemes from "./pages/schemes";
import Records from "./pages/records";
import Compare from "./pages/compare";
import SubmitHospital from "./pages/submit-hospital";
import Admin from "./pages/admin";
import Help from "./pages/help";
import Login from "./pages/login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/nearby" element={<Nearby />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/blood-bank" element={<BloodBank />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/records" element={<Records />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/submit-hospital" element={<SubmitHospital />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}