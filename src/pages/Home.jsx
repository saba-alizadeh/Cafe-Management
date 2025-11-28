// modules
import Button from '@mui/material/Button';
// pages and components
//import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar.jsx";
import DashboardBody from "../components/DashboardBody.jsx";
 import Navbar from '../components/HomePage.jsx';



export default function Home() {

    return (
        <div style={{backgroundColor: '#fceee9'}}>
            {/*<Sidebar/>*/}
            {/*<div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, right: '15vw', backgroundColor: '#fafafa', boxShadow: '1px 2px 10px darkgray', padding: '15px', color: 'black' }}>*/}
            {/*    <Navbar/>*/}
            {/*    <DashboardBody title='خوش آمدید' path='ورود > داشبورد'>*/}
            {/*        قثثقثقذ*/}
            {/*    </DashboardBody>*/}

            {/*</div>*/}

            <Navbar />



        </div>


    );
}
