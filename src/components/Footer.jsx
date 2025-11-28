import Button from '@mui/material/Button';


export default function Navbar() {

    return (
        <header style={{ width: "100%", backgroundColor: "white", height: "5vh", position: "fixed", bottom: "0", left: "0", right: "0", padding: "25px", alignItems: "center"}} >
            <Button variant="text">Text</Button>
            <Button variant="contained">Contained</Button>
            <Button variant="outlined">Outlined</Button>
        </header>
    );
}
