import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';

export default function Navbar() {

    return (
        <header style={{ width: "77.5vw", backgroundColor: "var(--color-secondary)", height: "5vh", position: "fixed", top: "2vh", left: "1vw", padding: "25px", alignItems: "right", textAlign: 'right', boxShadow: '1px 2px 10px gray', borderRadius: '10px' }}>
            <Button style={{ position: 'absolute', left: '3%' }} variant="contained">
                <LogoutIcon/>
            </Button>
            <Button variant="contained">
                <HomeIcon/>
            </Button>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Button variant="contained">
                <SettingsIcon/>
            </Button>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Button variant="contained">
                <MarkEmailUnreadIcon/>
            </Button>
        </header>
    );
}
