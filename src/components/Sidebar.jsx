import CustomButton from "./elements/SideBarButton.jsx";
import SideBarButton from "./elements/SideBarButton.jsx";

export default function Sidebar() {

    return (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '15vw', backgroundColor: '#fceee9', boxShadow: '1px 2px 10px darkgray', padding: '15px', zIndex: 2, alignItems: 'center', contentAlign: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <SideBarButton title="Home"/>
            <br/>
            <SideBarButton title="Home2"/>
            <br/>
            <SideBarButton title="Home3"/>
            <br/>
            <SideBarButton title="Home4"/>
        </div>
    );
}
